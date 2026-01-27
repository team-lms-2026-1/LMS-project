"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./SemesterCreateModal.module.css";

import { createSemester } from "../../api/semestersApi";
import { DatePickerInput } from "../ui/DatePickerInput";

type TermType = "FIRST" | "SECOND" | "SUMMER" | "WINTER";

const TERM_OPTIONS: Array<{ value: TermType; label: string }> = [
  { value: "FIRST", label: "1학기" },
  { value: "SECOND", label: "2학기" },
  { value: "SUMMER", label: "여름학기" },
  { value: "WINTER", label: "겨울학기" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function SemesterCreateModal({ open, onClose, onCreated }: Props) {
  const thisYear = useMemo(() => new Date().getFullYear(), []);

  const [year, setYear] = useState<number>(thisYear);
  const [term, setTerm] = useState<TermType>("FIRST");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ DatePickerInput popover 강제 닫기 신호
  const [closeSignal, setCloseSignal] = useState(0);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const resetAll = () => {
    setYear(thisYear);
    setTerm("FIRST");
    setStartDate("");
    setEndDate("");
    setError(null);
  };

  const handleClose = () => {
    // ✅ 모달 닫기 전에 popover 먼저 닫기 (removeChild 에러 방지)
    setCloseSignal((v) => v + 1);

    resetAll();
    onClose();
  };

  const validate = () => {
    if (!year || Number.isNaN(year)) return "연도를 입력하세요.";
    if (!startDate) return "시작일을 선택하세요.";
    if (!endDate) return "종료일을 선택하세요.";
    if (startDate > endDate) return "시작일은 종료일보다 늦을 수 없습니다.";
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
      await createSemester({ year, term, startDate, endDate });
      await onCreated();

      // ✅ 성공 후: popover 닫고 초기화
      setCloseSignal((v) => v + 1);
      resetAll();
      onClose();
    } catch (e: any) {
      // 팀 공통 에러 포맷({ error: { message } }) 대응 + fallback
      setError(e?.error?.message ?? e?.message ?? "등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="학기 등록"
      onClose={handleClose}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            저장
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 연도/학기/시작일/종료일 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>연도</div>
            <input
              className={styles.control}
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>학기</div>
            <select
              className={styles.control}
              value={term}
              onChange={(e) => setTerm(e.target.value as TermType)}
            >
              {TERM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <div className={styles.label}>시작일</div>
            <DatePickerInput
              value={startDate}
              onChange={(v) => {
                setStartDate(v);
                // ✅ 시작일 변경 시 종료일이 더 빠르면 초기화
                if (endDate && v > endDate) setEndDate("");
              }}
              placeholder="시작일 선택"
              closeSignal={closeSignal}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>종료일</div>
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              placeholder="종료일 선택"
              min={startDate || undefined} // ✅ 종료일은 시작일 이후만
              closeSignal={closeSignal}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
