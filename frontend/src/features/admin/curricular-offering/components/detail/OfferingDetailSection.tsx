"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./OfferingDetailSection.module.css";
import { Button } from "@/components/button";

import { DayOfWeekType, OfferingStatus } from "../../api/types";
import type { CurricularOfferingDetailDto, CurricularOfferingDetailUpdateRequest } from "../../api/types";
import { updateCurricularOfferingDetail } from "../../api/curricularOfferingsApi";
import { useI18n } from "@/i18n/useI18n";

// ✅ 생성 모달에서 쓰던 드롭다운 그대로 사용
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { DayOfWeekFilterDropdown } from "@/features/dropdowns/week/DayOfWeekFilterDropdown";
import { PeriodFilterDropdown } from "@/features/dropdowns/period/PeriodFilterDropdown";
import { DeptProfessorFilterDropdown } from "@/features/dropdowns/depts_professors/DeptProfessorFilterDropdown";

type Props = {
  offeringId?: number;
  data: CurricularOfferingDetailDto;
  onReload?: () => void | Promise<void>
};

export function OfferingDetailSection({ offeringId, data, onReload }: Props) {
  const t = useI18n("curricular.adminOfferingDetail.detail");
  const tCommon = useI18n("curricular.common");
  const tDay = useI18n("curricular.dayOfWeek");

  const [editMode, setEditMode] = useState(false);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ===== 기본 정보 (읽기 전용) =====
  const [offeringCode, setOfferingCode] = useState("");

  const [curricularId, setCurricularId] = useState<number>(0);
  const [curricularName, setCurricularName] = useState("");
  const [credits, setCredits] = useState<number>(0);
  const [description, setDescription] = useState("");

  // ===== 학과 / 학기 =====
  const [deptId, setDeptId] = useState<number>(0);
  const [deptName, setDeptName] = useState("");

  const [semesterId, setSemesterId] = useState<number>(0);
  const [semesterName, setSemesterName] = useState("");

  // ===== 교수 =====
  const [professorAccountId, setProfessorAccountId] = useState<number>(0);
  const [professorName, setProfessorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ===== 수업 정보 =====
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekType | "">("");
  const [period, setPeriod] = useState<number>(0);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [location, setLocation] = useState("");

  // ===== 상태 =====
  const [status, setStatus] = useState<OfferingStatus>("DRAFT");

  // ✅ 서버 정책: DRAFT만 수정 가능
  const editable = status === "DRAFT";

  // ✅ 수정모드에서만 disable 적용
  const formDisabled = saving || !editable;

  const deptIdStr = useMemo(() => (deptId > 0 ? String(deptId) : ""), [deptId]);

  const formatDayOfWeek = (v: DayOfWeekType | "" | null | undefined, mode: "short" | "long" = "short") => {
    if (!v) return "";

    switch (v) {
      case "MONDAY":
      case "TUESDAY":
      case "WEDNESDAY":
      case "THURSDAY":
      case "FRIDAY":
      case "SATURDAY":
      case "SUNDAY":
        return tDay(`${v}.${mode}`);
      default:
        return v;
    }
  };

  const hydrateFromData = (d: NonNullable<typeof data>) => {
    setOfferingCode(d.offeringCode);

    setCurricularId(d.curricularId);
    setCurricularName(d.curricularName);
    setCredits(d.credits);
    setDescription(d.description ?? "");

    setDeptId(d.deptId);
    setDeptName(d.deptName);

    setSemesterId(d.semesterId);
    setSemesterName(d.semesterName);

    setProfessorAccountId(d.professorAccountId);
    setProfessorName(d.professorName);
    setEmail(d.email);
    setPhone(d.phone);

    setDayOfWeek(d.dayOfWeek);
    setPeriod(d.period);
    setEnrolledCount(d.enrolledCount);
    setCapacity(d.capacity);
    setLocation(d.location);

    setStatus(d.status);
  };


  // data -> state 주입
  useEffect(() => {
    hydrateFromData(data);
    setSubmitError(null);
  }, [data]);

  const handleEnterEdit = () => {
    setSubmitError(null);
    if (!editable) {
      setSubmitError(t("messages.onlyDraft"));
      return;
    }
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    if (!data) {
      setEditMode(false);
      return;
    }
    hydrateFromData(data);
    setSubmitError(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!offeringId) return;

    // ✅ 최소 검증(요일 빈 값 방지)
    if (!dayOfWeek) {
      setSubmitError(t("messages.requiredDayOfWeek"));
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      const body: CurricularOfferingDetailUpdateRequest = {
        offeringCode: offeringCode.trim(),
        semesterId,
        dayOfWeek: dayOfWeek as DayOfWeekType,
        period,
        capacity,
        location: location.trim(),
        professorAccountId,
      };

      await updateCurricularOfferingDetail(offeringId, body);

      setEditMode(false);

      // ✅ 상세 재조회
      await onReload?.();
    } catch (e: any) {
      setSubmitError(e?.message ?? t("messages.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {submitError ? <div className={styles.error}>{submitError}</div> : null}

      {/* 교과: 수정 불가 */}
      <section className={styles.section}>
        <Header title={t("sections.course")} />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label={t("fields.curricularName")} value={curricularName} readonly={editMode} />
            <FieldView label={t("fields.deptName")} value={deptName} readonly={editMode} />
            <FieldView label={t("fields.credits")} value={credits} readonly={editMode} />
          </Row>
        </div>
      </section>

      {/* 운영 */}
      <section className={styles.section}>
        <Header title={t("sections.operation")} />
        <div className={styles.body}>
          <Row cols={3}>
            {editMode ? (
              <FieldEdit label={t("fields.offeringCode")} disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={offeringCode}
                  disabled={formDisabled}
                  onChange={(e) => setOfferingCode(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label={t("fields.offeringCode")} value={offeringCode} />
            )}

            <FieldView label={t("fields.enrolledCount")} value={enrolledCount} readonly={editMode} />

            {editMode ? (
              <FieldEdit label={t("fields.capacity")} disabled={formDisabled}>
                <input
                  type="number"
                  className={styles.control}
                  value={capacity === 0 ? "" : capacity}
                  disabled={formDisabled}
                  min={1}
                  max={9999}
                  onChange={(e) => setCapacity(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </FieldEdit>
            ) : (
              <FieldView label={t("fields.capacity")} value={capacity} />
            )}
          </Row>

          <Row cols={4}>
            {editMode ? (
              <FieldEditDropdown label={t("fields.semester")} disabled={formDisabled}>
                <SemesterFilterDropdown
                  value={semesterId > 0 ? String(semesterId) : ""}
                  onChange={(v) => setSemesterId(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label={t("fields.semester")} value={semesterName} />
            )}

            {editMode ? (
              <FieldEditDropdown label={t("fields.dayOfWeek")} disabled={formDisabled}>
                <DayOfWeekFilterDropdown
                  value={dayOfWeek}
                  onChange={(v) => setDayOfWeek(v as DayOfWeekType)}
                />
              </FieldEditDropdown>
            ) : (
              // ✅ 여기만 변경: 영어 enum → 한글 라벨
              <FieldView label={t("fields.dayOfWeek")} value={formatDayOfWeek(dayOfWeek, "short")} />
            )}

            {editMode ? (
              <FieldEditDropdown label={t("fields.period")} disabled={formDisabled}>
                <PeriodFilterDropdown
                  value={period > 0 ? String(period) : ""}
                  onChange={(v) => setPeriod(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label={t("fields.period")} value={t("fields.periodValue", { period })} />
            )}

            {editMode ? (
              <FieldEdit label={t("fields.location")} disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={location}
                  disabled={formDisabled}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label={t("fields.location")} value={location} />
            )}
          </Row>
        </div>
      </section>

      {/* 담당교수 */}
      <section className={styles.section}>
        <Header title={t("sections.professor")} />
        <div className={styles.body}>
          <Row cols={3}>
            {editMode ? (
              <FieldEditDropdown label={t("fields.professor")} disabled={formDisabled}>
                <DeptProfessorFilterDropdown
                  deptId={deptIdStr}
                  value={professorAccountId > 0 ? String(professorAccountId) : ""}
                  onChange={(v) => setProfessorAccountId(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label={t("fields.professorName")} value={professorName} />
            )}

            <FieldView
              label={t("fields.phone")}
              value={editMode ? <span className={styles.mutedText}>{t("messages.selectProfessorHint")}</span> : phone}
              readonly={editMode}
            />
            <FieldView
              label={t("fields.email")}
              value={editMode ? <span className={styles.mutedText}>{t("messages.selectProfessorHint")}</span> : email}
              readonly={editMode}
            />
          </Row>
        </div>
      </section>

      {/* 설명 */}
      <section className={styles.section}>
        <Header title={t("sections.remark")} />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>{t("fields.description")}</div>
            <div className={`${styles.descBox} ${editMode ? styles.readonlyBox : ""}`}>{description}</div>
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

/** ✅ 조회용 */
function FieldView({ label, value, readonly }: { label: string; value: React.ReactNode; readonly?: boolean }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.valueBox} ${readonly ? styles.readonlyBox : ""}`}>{value}</div>
    </div>
  );
}

/** ✅ 인풋용 */
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

/** ✅ 드롭다운용 */
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
