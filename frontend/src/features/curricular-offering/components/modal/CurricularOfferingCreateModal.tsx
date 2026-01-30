"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./CurricularOfferingCreateModal.module.css";

import { createCurricularOffering } from "../../api/curricularOfferingsApi";
import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { DeptCurricularFilterDropdown } from "@/features/dropdowns/depts_curriculars/DeptCurricularFilterDropdown";
import { DeptProfessorFilterDropdown } from "@/features/dropdowns/depts_professors/DeptProfessorFilterDropdown";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { DayOfWeekFilterDropdown } from "@/features/dropdowns/week/DayOfWeekFilterDropdown";

import type { DayOfWeekType } from "../../api/types";
import { PeriodFilterDropdown } from "@/features/dropdowns/period/PeriodFilterDropdown";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function CurricularOfferingCreateModal({ open, onClose, onCreated }: Props) {
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
  useEffect(() => {
    setProfessorEmail("");
    setProfessorPhone("");
  }, [professorAccountId]);

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
    if (!offeringCode.trim()) return "교과운영코드를 입력하세요.";
    if (semesterId <= 0) return "학기를 선택하세요.";
    if (deptId <= 0) return "주관학과를 선택하세요.";
    if (curricularId <= 0) return "교과를 선택하세요.";
    if (!dayOfWeek) return "요일을 선택하세요.";
    if (period <= 0) return "교시를 입력하세요.";
    if (capacity <= 0) return "인원수를 입력하세요.";
    if (!location.trim()) return "장소를 입력하세요.";
    if (professorAccountId <= 0) return "담당교수를 선택하세요.";
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
      setError(e?.error?.message ?? e?.message ?? "등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="교과운영 등록"
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <Button onClick={handleSubmit} loading={loading}>
            등록
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 운영코드 / 학기 / 주관학과 / 교과 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>교과운영코드</div>
            <input
              className={styles.control}
              value={offeringCode}
              onChange={(e) => setOfferingCode(e.target.value)}
              placeholder="예) CS101-1"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>학기</div>
            <SemesterFilterDropdown
              value={semesterId > 0 ? String(semesterId) : ""}
              onChange={(v) => setSemesterId(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>주관학과</div>
            <DeptFilterDropdown
              value={deptId > 0 ? String(deptId) : ""}
              onChange={(v) => setDeptId(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>교과</div>
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
            <div className={styles.label}>요일</div>
            <DayOfWeekFilterDropdown
              value={dayOfWeek}
              onChange={(v) => setDayOfWeek(v as DayOfWeekType)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>교시</div>
            <PeriodFilterDropdown
            value={period > 0 ? String(period) : ""}
            onChange={(v) => setPeriod(v ? Number(v) : 0)}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>인원수</div>
            <input
              className={styles.control}
              type="number"
              value={capacity === 0 ? "" : capacity}
              onChange={(e) => setCapacity(e.target.value === "" ? 0 : Number(e.target.value))}
              placeholder="예) 30"
              min={1}
              max={9999}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>장소</div>
            <input
              className={styles.control}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예) 본관 302호"
              autoComplete="off"
            />
          </label>
        </div>

        {/* ✅ 2×2: 담당교수 / 이메일(표시) / 전화(표시) / 빈칸 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>담당교수</div>
            <DeptProfessorFilterDropdown
              deptId={deptId > 0 ? String(deptId) : ""}
              value={professorAccountId > 0 ? String(professorAccountId) : ""}
              onChange={(v) => setProfessorAccountId(v ? Number(v) : 0)}
            />
          </label>
          <label className={styles.field}></label>

          <label className={styles.field}>
            <div className={styles.label}>교수 이메일</div>
            <input className={styles.control} value={professorEmail} disabled />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>교수 전화번호</div>
            <input className={styles.control} value={professorPhone} disabled />
          </label>
          <div />
        </div>
      </div>
    </Modal>
  );
}
