"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./SemetserEditModal.module.css";
import { DatePickerInput } from "../ui/DatePickerInput";
import { useI18n } from "@/i18n/useI18n";
import { useLocale } from "@/hooks/useLocale";

import { useSemesterDetail } from "../../hooks/useSemesterList";
import { SemesterStatus, SemesterTerm } from "../../api/types";
import { SEMESTER_STATUSES, statusToLabel, termToLabel } from "../../utils/semesterLabel";
import { patchSemester } from "../../api/semestersApi";


type Props = {
  open: boolean;
  semesterId?: string;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

export function SemesterEditModal({ open, semesterId, onClose, onUpdated }: Props) {
  const t = useI18n("authority.semesters.editModal");
  const { locale } = useLocale();
  const { state } = useSemesterDetail(semesterId, open);
  const { data, loading, error } = state;

  const [ saving, setSaving ] = useState(false);
  const [ submitError, setSubmitError ] = useState<string | null>(null);

  const [year, setYear] = useState<number | null>(null);
  const [term, setTerm] = useState<SemesterTerm | null>(null);
  const [status, setStatus] = useState<SemesterStatus>("PLANNED");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [closeSignal, setCloseSignal] = useState(0);

  const handlesubmit = async () => {
    if(!semesterId) return;

    setSaving(true);
    setSubmitError(null);

    try {
      await patchSemester( semesterId, {
        status,
        startDate,
        endDate,
      });

      await onUpdated(); // reload 추가

      setCloseSignal((v) => v + 1 );
      onClose();
    } catch (e: any) {
      setSubmitError(e?.message ?? t("messages.submitFailed"));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!open) return;

    if (!semesterId) {
      setYear(null);
      setTerm(null);
      setStatus("PLANNED");
      setStartDate("");
      setEndDate("");
      return;
    }

    if(!data) return;

    setYear(data.year);
    setTerm(data.term as SemesterTerm)
    setStatus(data.status as SemesterStatus)
    setStartDate(data.startDate)
    setEndDate(data.endDate)
  }, [open, semesterId, data]);

  const handleClose = () => {
    setCloseSignal((v) => v + 1);
    onClose();
  };

  const disabled = loading || !data ;

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={handleClose}
      size="md"
      footer={
        <>
          <Button variant="primary" onClick={handlesubmit} loading={saving} disabled={disabled || saving} >
            {t("buttons.save")}
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            {t("buttons.close")}
          </Button>
        </>
      }
    >
      {error && <div className={styles.error}>{error}</div>}
      {submitError && <div className={styles.error}>{submitError}</div>}

      <div className={styles.form}>
        <div className={styles.grid2}>
          {/* 연도 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.year")}</div>
            <input className={styles.control} value={year ?? ""} disabled />
          </label>

          {/* 학기 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.term")}</div>
            <input className={styles.control} value={term ? termToLabel(term, locale) : ""} disabled />
          </label>

          {/* 상태 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.status")}</div>
            <select
              className={styles.control}
              value={status}
              onChange={(e) => setStatus(e.target.value as SemesterStatus)}
              disabled={disabled}
            >
              {SEMESTER_STATUSES.map((v) => (
                <option key={v} value={v}>
                  {statusToLabel(v, locale)}
                </option>
              ))}
            </select>
          </label>

          <div />

          {/* 시작일 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.startDate")}</div>
            <DatePickerInput
              value={startDate}
              onChange={(v) => {
                setStartDate(v);
                if (endDate && v > endDate) setEndDate("");
              }}
              placeholder={t("placeholders.startDate")}
              closeSignal={closeSignal}
            />
          </label>

          {/* 종료일 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.endDate")}</div>
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              min={startDate || undefined}
              placeholder={t("placeholders.endDate")}
              closeSignal={closeSignal}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
