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
import { DatePickerInput } from "@/features/admin/authority/semesters/components/ui/DatePickerInput";
import { useI18n } from "@/i18n/useI18n";
import { stripSemesterSuffix } from "../../utils/semesterDisplayName";

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
  const t = useI18n("extraCurricular.adminOfferingDetail.detail");
  const tCommon = useI18n("curricular.common");

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
    setSemesterDisplayName(stripSemesterSuffix(d.semesterDisplayName ?? ""));

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

  const isValidPhone = useMemo(() => {
    if (!hostContactPhone.trim()) return true;
    return /^(01[016789]-?\d{3,4}-?\d{4}|0[2-9]-?\d{3,4}-?\d{4})$/.test(hostContactPhone.trim());
  }, [hostContactPhone]);

  const validate = (): string | null => {
    if (!extraOfferingCode.trim()) return t("messages.requiredOfferingCode");
    if (!extraOfferingName.trim()) return t("messages.requiredOfferingName");
    if (semesterId <= 0) return t("messages.requiredSemester");

    if (rewardPointDefault < 0) return t("messages.invalidRewardPoint");
    if (recognizedHoursDefault < 0) return t("messages.invalidRecognizedHours");

    if (!operationStartDate) return t("messages.requiredOperationStartDate");
    if (!operationEndDate) return t("messages.requiredOperationEndDate");
    if (operationStartDate > operationEndDate) return t("messages.invalidOperationPeriod");

    if (!isValidPhone) return t("messages.invalidContactPhone");
    if (!isValidEmail) return t("messages.invalidContactEmail");
    return null;
  };

  const handleEnterEdit = () => {
    setSubmitError(null);
    if (!editable) {
      setSubmitError(t("messages.onlyDraft"));
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
      setSubmitError(e?.error?.message ?? e?.message ?? t("messages.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {submitError ? <div className={styles.error}>{submitError}</div> : null}

      {/* 1) 비교과 마스터 */}
      <section className={styles.section}>
        <Header title={t("sections.program")} />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label={t("fields.programCode")} value={extraCurricularCode} />
            <FieldView label={t("fields.programName")} value={extraCurricularName} />
            <FieldView label={t("fields.hostOrgName")} value={hostOrgName} />
          </Row>
        </div>
      </section>

      {/* 2) 운영 */}
      <section className={styles.section}>
        <Header title={t("sections.operation")} />
        <div className={styles.body}>
          {/* ✅ 1줄(4칸): 운영코드/포인트/인정시간/등록인원 */}
          <Row cols={4}>
            {editMode ? (
              <FieldEdit label={t("fields.offeringCode")} disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={extraOfferingCode}
                  disabled={formDisabled}
                  onChange={(e) => setExtraOfferingCode(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label={t("fields.offeringCode")} value={extraOfferingCode} />
            )}

            {editMode ? (
              <FieldEdit label={t("fields.rewardPoint")} disabled={formDisabled}>
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
              <FieldView label={t("fields.rewardPoint")} value={rewardPointDefault} />
            )}

            {editMode ? (
              <FieldEdit label={t("fields.recognizedHours")} disabled={formDisabled}>
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
              <FieldView label={t("fields.recognizedHours")} value={recognizedHoursDefault} />
            )}

            <FieldView label={t("fields.enrolledCount")} value={enrolledCount} readonly={editMode} />
          </Row>

          {/* ✅ 2줄: 학기/운영시작일/운영종료일 */}
          <Row cols={3}>
            {editMode ? (
              <FieldEditDropdown label={t("fields.semester")} disabled={formDisabled}>
                <SemesterFilterDropdown
                  value={semesterId > 0 ? String(semesterId) : ""}
                  onChange={(v) => setSemesterId(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label={t("fields.semester")} value={semesterDisplayName} />
            )}

            {editMode ? (
              <FieldEditDropdown label={t("fields.operationStartDate")} disabled={formDisabled}>
                <DatePickerInput
                  value={operationStartDate}
                  onChange={(v) => {
                    setOperationStartDate(v);
                    if (operationEndDate && v > operationEndDate) setOperationEndDate("");
                  }}
                  placeholder={t("fields.operationStartDatePlaceholder")}
                  disabled={formDisabled}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label={t("fields.operationStartDate")} value={operationStartDate} />
            )}

            {editMode ? (
              <FieldEditDropdown label={t("fields.operationEndDate")} disabled={formDisabled}>
                <DatePickerInput
                  value={operationEndDate}
                  onChange={setOperationEndDate}
                  placeholder={t("fields.operationEndDatePlaceholder")}
                  min={operationStartDate || undefined}
                  disabled={formDisabled}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label={t("fields.operationEndDate")} value={operationEndDate} />
            )}
          </Row>
        </div>
      </section>

      {/* 3) 담당자 */}
      <section className={styles.section}>
        <Header title={t("sections.contact")} />
        <div className={styles.body}>
          <Row cols={3}>
            {editMode ? (
              <FieldEdit label={t("fields.contactName")} disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={hostContactName}
                  disabled={formDisabled}
                  onChange={(e) => setHostContactName(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label={t("fields.contactName")} value={hostContactName || "-"} />
            )}

            {editMode ? (
              <FieldEdit label={t("fields.contactPhone")} disabled={formDisabled}>
                <input
                  className={styles.control}
                  type="tel"
                  inputMode="numeric"
                  value={hostContactPhone}
                  disabled={formDisabled}
                  onChange={(e) => setHostContactPhone(e.target.value.replace(/[^0-9-]/g, ""))}
                />
              </FieldEdit>
            ) : (
              <FieldView label={t("fields.contactPhone")} value={hostContactPhone || "-"} />
            )}

            {editMode ? (
              <FieldEdit label={t("fields.contactEmail")} disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={hostContactEmail}
                  disabled={formDisabled}
                  onChange={(e) => setHostContactEmail(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label={t("fields.contactEmail")} value={hostContactEmail || "-"} />
            )}
          </Row>
        </div>
      </section>

      {/* 4) 비고 + ✅ 버튼은 여기로 */}
      <section className={styles.section}>
        <Header title={t("sections.remark")} />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>{t("fields.description")}</div>
            <div className={`${styles.descBox} ${styles.readonlyBox}`}>{description || "-"}</div>
          </div>
        </div>

        <div className={styles.sectionFooter}>
          {editMode ? (
            <>
              <Button variant="primary" onClick={handleSave} loading={saving} disabled={formDisabled}>
                {tCommon("saveButton")}
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
                {tCommon("cancelButton")}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleEnterEdit} disabled={!editable}>
              {tCommon("editButton")}
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
