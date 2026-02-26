"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./DignosisDetailModal.module.css";
import { useI18n } from "@/i18n/useI18n";
import { Modal } from "@/components/modal/Modal";
import { ConfirmModal } from "@/components/modal";
import { Button } from "@/components/button";
import { StatusPill, type StatusType } from "@/components/status";
import toast, { Toaster } from "react-hot-toast";
import {
  fetchDiagnosisDetail,
  submitDiagnosis,
} from "../../../api/DignosisApi";
import type {
  DiagnosisDetailDto,
  DiagnosisQuestionDetailDto,
  DiagnosisQuestionType,
  DiagnosisStatus,
  DiagnosisSubmitPayload,
  DignosisDetailModalProps,
} from "../../../api/types";

const SCALE_LABEL_KEYS = [
  "stronglyAgree",
  "agree",
  "neutral",
  "disagree",
  "stronglyDisagree",
] as const;

type QuestionItem = {
  id: number;
  text: string;
  type: DiagnosisQuestionType;
  order: number;
};

type AnswerState = Record<
  number,
  {
    scaleValue?: number;
    shortText?: string;
  }
>;

const LOCAL_TOASTER_ID = "dignosis-detail-modal";

function getStatusConfig(
  status: DiagnosisStatus | undefined,
  pendingLabel: string,
  submittedLabel: string
) {
  if (!status) return { label: "-", pill: "PENDING" as StatusType };
  const normalized = String(status).toUpperCase();
  if (normalized === "PENDING") return { label: pendingLabel, pill: "PENDING" as StatusType };
  if (normalized === "SUBMITTED") return { label: submittedLabel, pill: "COMPLETED" as StatusType };
  return { label: String(status), pill: "PENDING" as StatusType };
}

function normalizeQuestions(items?: DiagnosisQuestionDetailDto[]): QuestionItem[] {
  if (!items || items.length === 0) return [];
  return items
    .map((q, index) => ({
      id: Number(q.questionId),
      text: q.text ?? "",
      type: (q.type ?? "SCALE") as DiagnosisQuestionType,
      order: typeof q.order === "number" ? q.order : index + 1,
    }))
    .sort((a, b) => a.order - b.order);
}

function formatDate(value?: string) {
  if (!value) return "-";
  const text = String(value).trim();
  if (!text) return "-";
  const head = text.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head.replace(/-/g, ".");
  if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(head)) return head.replace(/[/-]/g, ".");
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return text;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatPeriod(start?: string, end?: string) {
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

const showErrorToast = (message: string) =>
  toast.error(message, { toasterId: LOCAL_TOASTER_ID });

export function DignosisDetailModal({
  open,
  onClose,
  dignosisId,
  onSubmitted,
}: DignosisDetailModalProps) {
  const t = useI18n("competency.studentDiagnosis.detailModal");

  const [detail, setDetail] = useState<DiagnosisDetailDto | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const questions = useMemo(() => normalizeQuestions(detail?.questions), [detail]);
  const title = detail?.basicInfo?.title ?? t("fallback.title");
  const startedAt = detail?.basicInfo?.startedAt;
  const endedAt = detail?.basicInfo?.endedAt;

  const statusConfig = useMemo(
    () =>
      getStatusConfig(
        detail?.basicInfo?.status,
        t("statusLabel.PENDING"),
        t("statusLabel.SUBMITTED")
      ),
    [detail?.basicInfo?.status, t]
  );

  const scaleLabels = useMemo(
    () => SCALE_LABEL_KEYS.map((key) => t(`scaleLabels.${key}`)),
    [t]
  );

  const isSubmitted = String(detail?.basicInfo?.status ?? "").toUpperCase() === "SUBMITTED";

  useEffect(() => {
    if (!open) return;
    if (!dignosisId) {
      setError(t("messages.missingDiagnosisInfo"));
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);
    setDetail(null);
    setAnswers({});

    (async () => {
      try {
        const res = await fetchDiagnosisDetail(dignosisId);
        if (!alive) return;
        setDetail(res.data ?? null);
      } catch (e: any) {
        if (!alive) return;
        console.error("[DignosisDetailModal]", e);
        setError(e?.message ?? t("messages.loadFailed"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, dignosisId, t]);

  useEffect(() => {
    if (open) return;
    setConfirmOpen(false);
    setSubmitting(false);
  }, [open]);

  const handleScaleChange = useCallback((questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], scaleValue: value },
    }));
  }, []);

  const handleShortChange = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], shortText: value },
    }));
  }, []);

  const missingCount = useMemo(() => {
    if (questions.length === 0) return 0;
    return questions.filter((q) => {
      const answer = answers[q.id];
      if (String(q.type).toUpperCase() === "SHORT") {
        return !answer?.shortText?.trim();
      }
      return !Number.isFinite(answer?.scaleValue);
    }).length;
  }, [answers, questions]);

  const handleSubmitClick = () => {
    if (isSubmitted || !dignosisId) return;
    if (missingCount > 0) {
      showErrorToast(t("messages.answerAllQuestions"));
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!dignosisId || submitting) return;
    setSubmitting(true);

    const payload: DiagnosisSubmitPayload = {
      answers: questions.map((q) => {
        const answer = answers[q.id] ?? {};
        const isShort = String(q.type).toUpperCase() === "SHORT";
        return {
          questionId: q.id,
          scaleValue: isShort ? null : answer.scaleValue ?? null,
          shortText: isShort ? (answer.shortText ?? "").trim() : null,
        };
      }),
    };

    try {
      await submitDiagnosis(dignosisId, payload);
      toast.success(t("messages.submitSuccess"));
      setConfirmOpen(false);
      onSubmitted?.();
      onClose();
    } catch (e: any) {
      console.error("[DignosisDetailModal submit]", e);
      showErrorToast(e?.message ?? t("messages.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {open && (
        <Toaster
          toasterId={LOCAL_TOASTER_ID}
          position="top-center"
          containerStyle={{ zIndex: 20000 }}
        />
      )}
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        size="lg"
        footer={
          <div className={styles.footer}>
            <div className={styles.footerNote}>
              {isSubmitted ? t("footer.submittedNote") : t("footer.submitNote")}
            </div>
            <div className={styles.footerActions}>
              <Button variant="secondary" onClick={onClose} disabled={submitting}>
                {t("buttons.close")}
              </Button>
              {!isSubmitted && (
                <Button
                  variant="primary"
                  onClick={handleSubmitClick}
                  loading={submitting}
                  disabled={loading || questions.length === 0}
                >
                  {t("buttons.submit")}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className={styles.root}>
          <div className={styles.header}>
            <div>
              <div className={styles.title}>{title}</div>
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t("meta.period")}</span>
                  <span className={styles.metaValue}>{formatPeriod(startedAt, endedAt)}</span>
                </div>
              </div>
            </div>
            <div className={styles.statusWrap}>
              <StatusPill status={statusConfig.pill} label={statusConfig.label} />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {loading ? (
            <div className={styles.loading}>{t("loadingText")}</div>
          ) : questions.length === 0 ? (
            <div className={styles.empty}>{t("emptyText")}</div>
          ) : (
            <div className={styles.questionList}>
              {questions.map((q, index) => {
                const isShort = String(q.type).toUpperCase() === "SHORT";
                const answer = answers[q.id] ?? {};
                return (
                  <div key={q.id} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionIndex}>Q{index + 1}</span>
                      <div className={styles.questionText}>{q.text || t("fallback.question")}</div>
                      <span className={styles.questionType}>
                        {isShort ? t("questionType.short") : t("questionType.scale")}
                      </span>
                    </div>

                    {isShort ? (
                      <textarea
                        className={styles.shortInput}
                        value={answer.shortText ?? ""}
                        onChange={(e) => handleShortChange(q.id, e.target.value)}
                        placeholder={t("placeholders.shortAnswer")}
                        disabled={isSubmitted || submitting}
                      />
                    ) : (
                      <div className={styles.scaleList}>
                        {scaleLabels.map((label, idx) => {
                          const optionValue = scaleLabels.length - idx;
                          const checked = answer.scaleValue === optionValue;
                          return (
                            <label
                              key={`${q.id}-${optionValue}`}
                              className={`${styles.scaleOption} ${isSubmitted ? styles.optionDisabled : ""}`}
                            >
                              <input
                                className={styles.scaleInput}
                                type="radio"
                                name={`q-${q.id}`}
                                checked={checked}
                                onChange={() => handleScaleChange(q.id, optionValue)}
                                disabled={isSubmitted || submitting}
                              />
                              <span className={styles.scaleLabel}>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        title={t("confirm.title")}
        message={t("confirm.message")}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
        loading={submitting}
      />
    </>
  );
}
