"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./CurricularOfferingCreateModal.module.css";

import { createCurricularOffering } from "../../api/curricularOfferingsApi";
import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { DeptCurricularFilterDropdown } from "@/features/dropdowns/depts_curriculars/DeptCurricularFilterDropdown";
import { DeptProfessorFilterDropdown } from "@/features/dropdowns/depts_professors/DeptProfessorFilterDropdown";
import type { DeptProfessorItem } from "@/features/dropdowns/depts_professors/types";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { DayOfWeekFilterDropdown } from "@/features/dropdowns/week/DayOfWeekFilterDropdown";

import type { DayOfWeekType } from "../../api/types";
import { PeriodFilterDropdown } from "@/features/dropdowns/period/PeriodFilterDropdown";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function CurricularOfferingCreateModal({ open, onClose, onCreated }: Props) {
  const t = useI18n("curricular.modal.offeringCreate");
  const tCommon = useI18n("curricular.common");

  // UI 제어용
  const [deptId, setDeptId] = useState<number>(0);

  // request payload
  const [offeringCode, setOfferingCode] = useState<string>("");
  const [curricularId, setCurricularId] = useState<number>(0);
  const [semesterId, setSemesterId] = useState<number>(0);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekType | "">("");
  const [period, setPeriod] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [location, setLocation] = useState<string>("");
  const [professorAccountId, setProfessorAccountId] = useState<number>(0);

  // 표시용(선택) - 아직 상세조회 붙이기 전이라 일단 비워둠
  const [professorEmail, setProfessorEmail] = useState<string>("");
  const [professorPhone, setProfessorPhone] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  // ✅ 학과 변경 시 종속 값 초기화
  useEffect(() => {
    setCurricularId(0);
    setProfessorAccountId(0);
    setProfessorEmail("");
    setProfessorPhone("");
  }, [deptId]);

  // ✅ (선택) 교수 선택 초기화/변경 시 표시용 값 초기화
  const handleProfessorSelect = (item: DeptProfessorItem | null) => {
    setProfessorEmail(item?.email ?? "");
    setProfessorPhone(item?.phone ?? "");
  };

  const resetAll = () => {
    setDeptId(0);

    setOfferingCode("");
    setCurricularId(0);
    setSemesterId(0);
    setDayOfWeek("");
    setPeriod(0);
    setCapacity(0);
    setLocation("");
    setProfessorAccountId(0);

    setProfessorEmail("");
    setProfessorPhone("");

    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose();
  };

  const validate = (): string | null => {
    if (!offeringCode.trim()) return t("validation.requiredOfferingCode");
    if (semesterId <= 0) return t("validation.requiredSemester");
    if (deptId <= 0) return t("validation.requiredDept");
    if (curricularId <= 0) return t("validation.requiredCurricular");
    if (!dayOfWeek) return t("validation.requiredDayOfWeek");
    if (period <= 0) return t("validation.requiredPeriod");
    if (capacity <= 0) return t("validation.requiredCapacity");
    if (!location.trim()) return t("validation.requiredLocation");
    if (professorAccountId <= 0) return t("validation.requiredProfessor");
    return null;
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createCurricularOffering({
      offeringCode: offeringCode.trim(),
      curricularId,
      semesterId,
      dayOfWeek: dayOfWeek as DayOfWeekType,
      period,
      capacity,
      location: location.trim(),
      professorAccountId,
      });
      await onCreated();

      resetAll();
      onClose();
    } catch (e: any) {
      setError(e?.error?.message ?? e?.message ?? t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <Button onClick={handleSubmit} loading={loading}>
            {tCommon("registerButton")}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {tCommon("cancelButton")}
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 운영코드 / 학기 / 주관학과 / 교과 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("offeringCodeLabel")}</div>
            <input
              className={styles.control}
              value={offeringCode}
              onChange={(e) => setOfferingCode(e.target.value)}
              placeholder={t("offeringCodePlaceholder")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("semesterLabel")}</div>
            <SemesterFilterDropdown
              value={semesterId > 0 ? String(semesterId) : ""}
              onChange={(v) => setSemesterId(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("deptLabel")}</div>
            <DeptFilterDropdown
              value={deptId > 0 ? String(deptId) : ""}
              onChange={(v) => setDeptId(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("curricularLabel")}</div>
            <DeptCurricularFilterDropdown
              deptId={deptId > 0 ? String(deptId) : ""}
              value={curricularId > 0 ? String(curricularId) : ""}
              onChange={(v) => setCurricularId(v ? Number(v) : 0)}
            />
          </label>
        </div>

        {/* ✅ 2×2: 요일 / 교시 / 인원수 / 장소 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("dayOfWeekLabel")}</div>
            <DayOfWeekFilterDropdown
              value={dayOfWeek}
              onChange={(v) => setDayOfWeek(v as DayOfWeekType)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("periodLabel")}</div>
            <PeriodFilterDropdown
            value={period > 0 ? String(period) : ""}
            onChange={(v) => setPeriod(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("capacityLabel")}</div>
            <input
              className={styles.control}
              type="number"
              value={capacity === 0 ? "" : capacity}
              onChange={(e) => setCapacity(e.target.value === "" ? 0 : Number(e.target.value))}
              placeholder={t("capacityPlaceholder")}
              min={1}
              max={9999}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("locationLabel")}</div>
            <input
              className={styles.control}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("locationPlaceholder")}
              autoComplete="off"
            />
          </label>
        </div>

        {/* ✅ 2×2: 담당교수 / 이메일(표시) / 전화(표시) / 빈칸 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("professorLabel")}</div>
            <DeptProfessorFilterDropdown
              deptId={deptId > 0 ? String(deptId) : ""}
              value={professorAccountId > 0 ? String(professorAccountId) : ""}
              onChange={(v) => setProfessorAccountId(v ? Number(v) : 0)}
              onSelectItem={handleProfessorSelect}
            />
          </label>
          <label className={styles.field}></label>

          <label className={styles.field}>
            <div className={styles.label}>{t("professorEmailLabel")}</div>
            <input className={styles.control} value={professorEmail} disabled />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("professorPhoneLabel")}</div>
            <input className={styles.control} value={professorPhone} disabled />
          </label>
          <div />
        </div>
      </div>
    </Modal>
  );
}
