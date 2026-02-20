"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./SemesterCreateModal.module.css";
import { useI18n } from "@/i18n/useI18n";
import { useLocale } from "@/hooks/useLocale";

import { createSemester } from "../../api/semestersApi";
import { DatePickerInput } from "../ui/DatePickerInput";
import { SEMESTER_TERMS, termToLabel } from "../../utils/semesterLabel";

type TermType = "FIRST" | "SECOND" | "SUMMER" | "WINTER";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function SemesterCreateModal({ open, onClose, onCreated }: Props) {
  const thisYear = useMemo(() => new Date().getFullYear(), []);
  const t = useI18n("authority.semesters.createModal");
  const { locale } = useLocale();

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
    if (!year || Number.isNaN(year)) return t("validation.requiredYear");
    if (!startDate) return t("validation.requiredStartDate");
    if (!endDate) return t("validation.requiredEndDate");
    if (startDate > endDate) return t("validation.invalidPeriod");
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
      setError(e?.error?.message ?? e?.message ?? t("messages.submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={handleClose}
      size="md"
      footer={
        <>
          <Button onClick={handleSubmit} loading={loading}>
            {t("buttons.create")}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {t("buttons.cancel")}
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 연도/학기/시작일/종료일 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.year")}</div>
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
            <div className={styles.label}>{t("fields.term")}</div>
            <select
              className={styles.control}
              value={term}
              onChange={(e) => setTerm(e.target.value as TermType)}
            >
              {SEMESTER_TERMS.map((opt) => (
                <option key={opt} value={opt}>
                  {termToLabel(opt, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.startDate")}</div>
            <DatePickerInput
              value={startDate}
              onChange={(v) => {
                setStartDate(v);
                // ✅ 시작일 변경 시 종료일이 더 빠르면 초기화
                if (endDate && v > endDate) setEndDate("");
              }}
              placeholder={t("placeholders.startDate")}
              closeSignal={closeSignal}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.endDate")}</div>
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              placeholder={t("placeholders.endDate")}
              min={startDate || undefined} // ✅ 종료일은 시작일 이후만
              closeSignal={closeSignal}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
