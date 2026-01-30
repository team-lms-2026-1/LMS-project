// features/curricular/offerings/components/OfferingDetailSection.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./OfferingDetailSection.module.css";
import { Button } from "@/components/button";

import { useCurricularDetail } from "../../hooks/useCurricularOfferingList";
import { DayOfWeekType, OfferingStatus } from "../../api/types";
import type { CurricularOfferingDetailDto, CurricularOfferingDetailUpdateRequest } from "../../api/types";
import { updateCurricularOfferingDetail } from "../../api/curricularOfferingsApi";

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

/** ✅ 표시용 요일 라벨 */
const DAY_OF_WEEK_LABEL: Record<
  Exclude<DayOfWeekType, string> | string,
  { short: string; long: string }
> = {
  MONDAY: { short: "월", long: "월요일" },
  TUESDAY: { short: "화", long: "화요일" },
  WEDNESDAY: { short: "수", long: "수요일" },
  THURSDAY: { short: "목", long: "목요일" },
  FRIDAY: { short: "금", long: "금요일" },
  SATURDAY: { short: "토", long: "토요일" },
  SUNDAY: { short: "일", long: "일요일" },
};

function formatDayOfWeek(v: DayOfWeekType | "" | null | undefined, mode: "short" | "long" = "short") {
  if (!v) return "";
  const hit = DAY_OF_WEEK_LABEL[v];
  return hit ? hit[mode] : v; // 혹시 모르는 값이면 원문 그대로
}

export function OfferingDetailSection({ offeringId, data, onReload }: Props) {

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
      setSubmitError("DRAFT 상태에서만 수정할 수 있습니다.");
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
      setSubmitError("요일을 선택해 주세요.");
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
      setSubmitError(e?.message ?? "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {submitError ? <div className={styles.error}>{submitError}</div> : null}

      {/* 교과: 수정 불가 */}
      <section className={styles.section}>
        <Header title="교과" />
        <div className={styles.body}>
          <Row cols={3}>
            <FieldView label="교과명" value={curricularName} readonly={editMode} />
            <FieldView label="주관학과" value={deptName} readonly={editMode} />
            <FieldView label="학점" value={credits} readonly={editMode} />
          </Row>
        </div>
      </section>

      {/* 운영 */}
      <section className={styles.section}>
        <Header title="운영" />
        <div className={styles.body}>
          <Row cols={3}>
            {editMode ? (
              <FieldEdit label="운영코드" disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={offeringCode}
                  disabled={formDisabled}
                  onChange={(e) => setOfferingCode(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label="운영코드" value={offeringCode} />
            )}

            <FieldView label="등록인원" value={enrolledCount} readonly={editMode} />

            {editMode ? (
              <FieldEdit label="수용인원" disabled={formDisabled}>
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
              <FieldView label="수용인원" value={capacity} />
            )}
          </Row>

          <Row cols={4}>
            {editMode ? (
              <FieldEditDropdown label="학기" disabled={formDisabled}>
                <SemesterFilterDropdown
                  value={semesterId > 0 ? String(semesterId) : ""}
                  onChange={(v) => setSemesterId(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label="학기" value={semesterName} />
            )}

            {editMode ? (
              <FieldEditDropdown label="요일" disabled={formDisabled}>
                <DayOfWeekFilterDropdown
                  value={dayOfWeek}
                  onChange={(v) => setDayOfWeek(v as DayOfWeekType)}
                />
              </FieldEditDropdown>
            ) : (
              // ✅ 여기만 변경: 영어 enum → 한글 라벨
              <FieldView label="요일" value={formatDayOfWeek(dayOfWeek, "short")} />
            )}

            {editMode ? (
              <FieldEditDropdown label="교시" disabled={formDisabled}>
                <PeriodFilterDropdown
                  value={period > 0 ? String(period) : ""}
                  onChange={(v) => setPeriod(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label="교시" value={`${period}교시`} />
            )}

            {editMode ? (
              <FieldEdit label="장소" disabled={formDisabled}>
                <input
                  className={styles.control}
                  value={location}
                  disabled={formDisabled}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </FieldEdit>
            ) : (
              <FieldView label="장소" value={location} />
            )}
          </Row>
        </div>
      </section>

      {/* 담당교수 */}
      <section className={styles.section}>
        <Header title="담당교수" />
        <div className={styles.body}>
          <Row cols={3}>
            {editMode ? (
              <FieldEditDropdown label="담당교수" disabled={formDisabled}>
                <DeptProfessorFilterDropdown
                  deptId={deptIdStr}
                  value={professorAccountId > 0 ? String(professorAccountId) : ""}
                  onChange={(v) => setProfessorAccountId(v ? Number(v) : 0)}
                />
              </FieldEditDropdown>
            ) : (
              <FieldView label="담당교수명" value={professorName} />
            )}

            <FieldView
              label="전화번호"
              value={editMode ? <span className={styles.mutedText}>교수 선택 후 반영</span> : phone}
              readonly={editMode}
            />
            <FieldView
              label="이메일"
              value={editMode ? <span className={styles.mutedText}>교수 선택 후 반영</span> : email}
              readonly={editMode}
            />
          </Row>
        </div>
      </section>

      {/* 설명 */}
      <section className={styles.section}>
        <Header title="설명" />
        <div className={styles.body}>
          <div className={styles.descRow}>
            <div className={styles.descLabel}>설명</div>
            <div className={`${styles.descBox} ${editMode ? styles.readonlyBox : ""}`}>{description}</div>
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
