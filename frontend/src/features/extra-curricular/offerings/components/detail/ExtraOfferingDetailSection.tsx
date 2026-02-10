"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./ExtraOfferingDetailSection.module.css";
import { Button } from "@/components/button";

import type {
  ExtraCurricularOfferingDetailDto,
  ExtraCurricularOfferingDetailUpdateRequest,
  ExtraOfferingStatus,
} from "../../api/types";

import { updateExtraCurricularOfferingDetail } from "../../api/extraCurricularOfferingApi";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";

type Props = {
  offeringId?: number;
  data: ExtraCurricularOfferingDetailDto;
  onReload?: () => void | Promise<void>;
};

function toStartAt(date: string) {
  return `${date}T00:00:00`;
}
function toEndAt(date: string) {
  return `${date}T23:59:59`;
}
function pickDate(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ExtraOfferingDetailSection({ offeringId, data, onReload }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ===== (비교과 마스터) =====
  const [extraCurricularCode, setExtraCurricularCode] = useState("");
  const [extraCurricularName, setExtraCurricularName] = useState("");
  const [hostOrgName, setHostOrgName] = useState("");
  const [description, setDescription] = useState("");

  // ===== (운영) =====
  const [extraOfferingCode, setExtraOfferingCode] = useState("");
  const [extraOfferingName, setExtraOfferingName] = useState("");

  const [semesterId, setSemesterId] = useState<number>(0);
  const [semesterDisplayName, setSemesterDisplayName] = useState("");

  const [rewardPointDefault, setRewardPointDefault] = useState<number>(0);
  const [recognizedHoursDefault, setRecognizedHoursDefault] = useState<number>(0);

  const [operationStartDate, setOperationStartDate] = useState<string>("");
  const [operationEndDate, setOperationEndDate] = useState<string>("");

  // ===== (담당자) =====
  const [hostContactName, setHostContactName] = useState("");
  const [hostContactPhone, setHostContactPhone] = useState("");
  const [hostContactEmail, setHostContactEmail] = useState("");

  const [status, setStatus] = useState<ExtraOfferingStatus>("DRAFT");

  // 등록인원(읽기 전용) - DTO에 enrolledCount 있으면 그걸 쓰고, 없으면 0
  const enrolledCount = (data as any).enrolledCount ?? 0;

  // 정책: DRAFT만 수정 가능
  const editable = status === "DRAFT";
  const formDisabled = saving || !editable;

  const hydrateFromData = (d: ExtraCurricularOfferingDetailDto) => {
    setExtraCurricularCode(d.extraCurricularCode ?? "");
    setExtraCurricularName(d.extraCurricularName ?? "");
    setHostOrgName(d.hostOrgName ?? "");
    setDescription(d.description ?? "");

    setExtraOfferingCode(d.extraOfferingCode ?? "");
    setExtraOfferingName(d.extraOfferingName ?? "");

    setSemesterId(d.semesterId ?? 0);
    setSemesterDisplayName(d.semesterDisplayName ?? "");

    setRewardPointDefault(d.rewardPointDefault ?? 0);
    setRecognizedHoursDefault(d.recognizedHoursDefault ?? 0);

    setOperationStartDate(pickDate(d.operationStartAt));
    setOperationEndDate(pickDate(d.operationEndAt));

    setHostContactName(d.hostContactName ?? "");
    setHostContactPhone(d.hostContactPhone ?? "");
    setHostContactEmail(d.hostContactEmail ?? "");

    setStatus(d.status ?? "DRAFT");
  };

  useEffect(() => {
    hydrateFromData(data);
    setSubmitError(null);
    setEditMode(false);
  }, [data]);

  const isValidEmail = useMemo(() => {
    if (!hostContactEmail.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hostContactEmail.trim());
  }, [hostContactEmail]);

  const validate = (): string | null => {
    if (!extraOfferingCode.trim()) return "운영코드를 입력하세요.";
    if (!extraOfferingName.trim()) return "운영명을 입력하세요.";
    if (semesterId <= 0) return "학기를 선택하세요.";

    if (rewardPointDefault < 0) return "포인트(기본)는 0 이상이어야 합니다.";
    if (recognizedHoursDefault < 0) return "인정시간(기본)은 0 이상이어야 합니다.";

    if (!operationStartDate) return "운영 시작일을 선택하세요.";
    if (!operationEndDate) return "운영 종료일을 선택하세요.";
    if (operationStartDate > operationEndDate) return "시작일은 종료일보다 늦을 수 없습니다.";

    if (!isValidEmail) return "담당자 이메일 형식이 올바르지 않습니다.";
    return null;
  };

  const handleEnterEdit = () => {
    setSubmitError(null);
    if (!editable) {
      setSubmitError("DRAFT 상태에서만 수정할 수 있습니다.");
      return;
    }
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    hydrateFromData(data);
    setSubmitError(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!offeringId) return;

    const msg = validate();
    if (msg) {
      setSubmitError(msg);
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      const body: ExtraCurricularOfferingDetailUpdateRequest = {
        extraOfferingCode: extraOfferingCode.trim(),
        extraOfferingName: extraOfferingName.trim(),

        hostContactName: hostContactName.trim(),
        hostContactPhone: hostContactPhone.trim(),
        hostContactEmail: hostContactEmail.trim(),

        rewardPointDefault,
        recognizedHoursDefault,

        semesterId,

        operationStartAt: toStartAt(operationStartDate),
        operationEndAt: toEndAt(operationEndDate),
      };

      await updateExtraCurricularOfferingDetail(offeringId, body);

      setEditMode(false);
      await onReload?.();
    } catch (e: any) {
      setSubmitError(e?.error?.message ?? e?.message ?? "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {submitError ? <div className={styles.error}>{submitError}</div> : null}

      {/* 1) 비교과 마스터 */}
      <section className={styles.section}>
        <Header title="비교과" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="비교과코드" value={extraCurricularCode} />
            <FieldView label="비교과명" value={extraCurricularName} />
            <FieldView label="주관기관" value={hostOrgName} />
          </Row>
        </div>
      </section>

      {/* 2) 운영 */}
      <section className={styles.section}>
        <Header title="운영" />
        <div className={styles.body}>
          {/* ✅ 1줄(4칸): 운영코드/포인트/인정시간/등록인원 */}
          <Row cols={4}>
            {editMode ? (
              <FieldEdit label="운영코드" disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={extraOfferingCode}
                  disabled={formDisabled}
                  onChange={(e) => setExtraOfferingCode(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label="운영코드" value={extraOfferingCode} />
            )}

            {editMode ? (
              <FieldEdit label="포인트" disabled={formDisabled}>
                <input
                  className={styles.control}
                  type="number"
                  min={0}
                  max={999999}
                  value={rewardPointDefault === 0 ? "" : rewardPointDefault}
                  disabled={formDisabled}
                  onChange={(e) =>
                    setRewardPointDefault(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
              </FieldEdit>
            ) : (
              <FieldView label="포인트" value={rewardPointDefault} />
            )}

            {editMode ? (
              <FieldEdit label="인정시간" disabled={formDisabled}>
                <input
                  className={styles.control}
                  type="number"
                  min={0}
                  max={999999}
                  value={recognizedHoursDefault === 0 ? "" : recognizedHoursDefault}
                  disabled={formDisabled}
                  onChange={(e) =>
                    setRecognizedHoursDefault(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
              </FieldEdit>
            ) : (
              <FieldView label="인정시간" value={recognizedHoursDefault} />
            )}

            <FieldView label="등록인원" value={enrolledCount} readonly={editMode} />
          </Row>

          {/* ✅ 2줄: 학기/운영시작일/운영종료일 */}
          <Row cols={3}>
            {editMode ? (
              <FieldEditDropdown label="학기" disabled={formDisabled}>
                <SemesterFilterDropdown
                  value={semesterId > 0 ? String(semesterId) : ""}
                  onChange={(v) => setSemesterId(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label="학기" value={semesterDisplayName} />
            )}

            {editMode ? (
              <FieldEditDropdown label="운영 시작일" disabled={formDisabled}>
                <DatePickerInput
                  value={operationStartDate}
                  onChange={(v) => {
                    setOperationStartDate(v);
                    if (operationEndDate && v > operationEndDate) setOperationEndDate("");
                  }}
                  placeholder="시작일 선택"
                  disabled={formDisabled}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label="운영 시작일" value={operationStartDate} />
            )}

            {editMode ? (
              <FieldEditDropdown label="운영 종료일" disabled={formDisabled}>
                <DatePickerInput
                  value={operationEndDate}
                  onChange={setOperationEndDate}
                  placeholder="종료일 선택"
                  min={operationStartDate || undefined}
                  disabled={formDisabled}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label="운영 종료일" value={operationEndDate} />
            )}
          </Row>
        </div>
      </section>

      {/* 3) 담당자 */}
      <section className={styles.section}>
        <Header title="담당자" />
        <div className={styles.body}>
          <Row cols={3}>
            {editMode ? (
              <FieldEdit label="담당자명" disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={hostContactName}
                  disabled={formDisabled}
                  onChange={(e) => setHostContactName(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label="담당자명" value={hostContactName || "-"} />
            )}

            {editMode ? (
              <FieldEdit label="담당자 전화" disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={hostContactPhone}
                  disabled={formDisabled}
                  onChange={(e) => setHostContactPhone(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label="담당자 전화" value={hostContactPhone || "-"} />
            )}

            {editMode ? (
              <FieldEdit label="담당자 이메일" disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={hostContactEmail}
                  disabled={formDisabled}
                  onChange={(e) => setHostContactEmail(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label="담당자 이메일" value={hostContactEmail || "-"} />
            )}
          </Row>
        </div>
      </section>

      {/* 4) 비고 + ✅ 버튼은 여기로 */}
      <section className={styles.section}>
        <Header title="비고" />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>설명</div>
            <div className={`${styles.descBox} ${styles.readonlyBox}`}>{description || "-"}</div>
          </div>
        </div>

        <div className={styles.sectionFooter}>
          {editMode ? (
            <>
              <Button variant="primary" onClick={handleSave} loading={saving} disabled={formDisabled}>
                저장
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
                취소
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleEnterEdit} disabled={!editable}>
              수정
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>{title}</div>
    </div>
  );
}

function Row({ cols, children }: { cols: 3 | 4; children: React.ReactNode }) {
  return <div className={cols === 3 ? styles.row3 : styles.row4}>{children}</div>;
}

function FieldView({ label, value, readonly }: { label: string; value: React.ReactNode; readonly?: boolean }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.valueBox} ${readonly ? styles.readonlyBox : ""}`}>{value}</div>
    </div>
  );
}

function FieldEdit({
  label,
  children,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className={styles.fieldEdit} aria-disabled={disabled}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.valueBox} ${styles.editBox}`}>{children}</div>
    </label>
  );
}

function FieldEditDropdown({
  label,
  children,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={styles.fieldEdit} aria-disabled={disabled}>
      <div className={styles.label}>{label}</div>
      <div className={styles.dropdownOnlyWrap}>{children}</div>
    </div>
  );
}
