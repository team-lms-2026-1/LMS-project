"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./DignosisDetailModal.module.css";
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

const SCALE_LABELS = ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "매우 그렇지 않다"];

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

const STATUS_MAP: Record<string, { label: string; pill: StatusType }> = {
  PENDING: { label: "미응답", pill: "PENDING" },
  SUBMITTED: { label: "응답완료", pill: "COMPLETED" },
};

function getStatusConfig(status?: DiagnosisStatus) {
  if (!status) return { label: "-", pill: "PENDING" as StatusType };
  return STATUS_MAP[String(status).toUpperCase()] ?? { label: String(status), pill: "PENDING" as StatusType };
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
  const [detail, setDetail] = useState<DiagnosisDetailDto | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const questions = useMemo(() => normalizeQuestions(detail?.questions), [detail]);
  const title = detail?.basicInfo?.title ?? "역량 진단서";
  const startedAt = detail?.basicInfo?.startedAt;
  const endedAt = detail?.basicInfo?.endedAt;

  const statusConfig = getStatusConfig(detail?.basicInfo?.status);
  const isSubmitted = String(detail?.basicInfo?.status ?? "").toUpperCase() === "SUBMITTED";

  useEffect(() => {
    if (!open) return;
    if (!dignosisId) {
      setError("진단서 정보가 없습니다.");
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
        setError(e?.message ?? "진단서 상세를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, dignosisId]);

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
    if (isSubmitted) return;
    if (!dignosisId) return;
    if (missingCount > 0) {
      showErrorToast("모든 문항에 응답해주세요.");
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
      toast.success("응답이 제출되었습니다.");
      setConfirmOpen(false);
      onSubmitted?.();
      onClose();
    } catch (e: any) {
      console.error("[DignosisDetailModal submit]", e);
      showErrorToast(e?.message ?? "응답 제출에 실패했습니다.");
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
              {isSubmitted ? "이미 응답이 완료된 진단서입니다." : "제출 후에는 수정할 수 없습니다."}
            </div>
            <div className={styles.footerActions}>
              <Button variant="secondary" onClick={onClose} disabled={submitting}>
                닫기
              </Button>
              {!isSubmitted && (
                <Button
                  variant="primary"
                  onClick={handleSubmitClick}
                  loading={submitting}
                  disabled={loading || questions.length === 0}
                >
                  제출
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
                  <span className={styles.metaLabel}>기간</span>
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
            <div className={styles.loading}>진단서를 불러오는 중입니다...</div>
          ) : questions.length === 0 ? (
            <div className={styles.empty}>등록된 문항이 없습니다.</div>
          ) : (
            <div className={styles.questionList}>
              {questions.map((q, index) => {
                const isShort = String(q.type).toUpperCase() === "SHORT";
                const answer = answers[q.id] ?? {};
                return (
                  <div key={q.id} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionIndex}>Q{index + 1}</span>
                      <div className={styles.questionText}>{q.text || "질문"}</div>
                      <span className={styles.questionType}>{isShort ? "단답형" : "척도형"}</span>
                    </div>

                    {isShort ? (
                      <textarea
                        className={styles.shortInput}
                        value={answer.shortText ?? ""}
                        onChange={(e) => handleShortChange(q.id, e.target.value)}
                        placeholder="응답을 입력하세요."
                        disabled={isSubmitted || submitting}
                      />
                    ) : (
                      <div className={styles.scaleList}>
                        {SCALE_LABELS.map((label, idx) => {
                          const optionValue = SCALE_LABELS.length - idx;
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
        title="진단서 제출"
        message="제출 후에는 수정할 수 없습니다. 제출하시겠습니까?"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
        loading={submitting}
      />
    </>
  );
}
