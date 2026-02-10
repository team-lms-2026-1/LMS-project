"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./DignosisDetailModal.module.css";
import type {
  DiagnosisScaleOption,
  DiagnosisQuestion,
  DiagnosisDetailValue,
} from "@/features/competencies/diagnosis/api/types";

type Props = {
  open: boolean;
  onClose: () => void;
  value?: Partial<DiagnosisDetailValue>;
  onEdit?: () => void;
};

const SCORE_OPTIONS = [1, 2, 3, 4, 5];
const SCALE_LABELS = ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "매우 그렇지 않다"];
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const text = String(value).trim();
  if (!text) return "-";

  const head = text.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    return head.replace(/-/g, ".");
  }
  if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(head)) {
    return head.replace(/[/-]/g, ".");
  }

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

function createScaleOptions(): DiagnosisScaleOption[] {
  return SCALE_LABELS.map((label, index) => ({
    id: makeId(),
    label,
    score: SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - index] ?? 1,
  }));
}

function createDefaultQuestion(): DiagnosisQuestion {
  return {
    id: makeId(),
    title: "",
    type: "SCALE",
    scaleOptions: createScaleOptions(),
    shortAnswer: "",
    csScores: {
      criticalThinking: 5,
      character: 5,
      communication: 5,
      collaboration: 5,
      creativity: 5,
      convergence: 5,
    },
  };
}

function normalizeQuestions(questions?: DiagnosisQuestion[]): DiagnosisQuestion[] {
  if (!questions || questions.length === 0) return [createDefaultQuestion()];
  return questions.map((q) => ({
    id: q.id || makeId(),
    title: q.title ?? "",
    type: q.type ?? "SCALE",
    scaleOptions:
      q.scaleOptions && q.scaleOptions.length > 0
        ? q.scaleOptions.map((opt, idx) => ({
            id: opt.id || makeId(),
            label: opt.label ?? SCALE_LABELS[idx] ?? "",
            score: opt.score ?? SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - idx] ?? 1,
          }))
        : createScaleOptions(),
    shortAnswer: q.shortAnswer ?? "",
    csScores: {
      criticalThinking: q.csScores?.criticalThinking ?? 5,
      character: q.csScores?.character ?? 5,
      communication: q.csScores?.communication ?? 5,
      collaboration: q.csScores?.collaboration ?? 5,
      creativity: q.csScores?.creativity ?? 5,
      convergence: q.csScores?.convergence ?? 5,
    },
  }));
}

export function DignosisDetailModal({ open, onClose, value, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<"QUESTION" | "ANSWER">("QUESTION");
  const [questions, setQuestions] = useState<DiagnosisQuestion[]>([createDefaultQuestion()]);
  const startedAt =
    value?.startedAt ??
    (value as any)?.basicInfo?.startedAt ??
    (value as any)?.startDate ??
    "";
  const endedAt =
    value?.endedAt ??
    (value as any)?.basicInfo?.endedAt ??
    (value as any)?.endDate ??
    "";

  useEffect(() => {
    if (!open) return;
    setActiveTab("QUESTION");
    setQuestions(normalizeQuestions(value?.questions));
  }, [open, value]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnBackdrop={false}
      closeOnEsc={false}
      size="lg"
      footer={
        <>
          <Button variant="primary" onClick={onEdit} disabled={!onEdit}>
            수정
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
        </>
      }
    >
      <div className={styles.root}>
        <div className={styles.topRow}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "QUESTION" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("QUESTION")}
            >
              질문
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "ANSWER" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("ANSWER")}
            >
              응답
            </button>
          </div>
        </div>

        {activeTab === "ANSWER" ? (
          <div className={styles.placeholder}>
            응답 영역은 준비 중입니다.
          </div>
        ) : (
          <>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <div className={styles.formTitle}>
                  <div className={styles.formTitleMain}>역량 진단서</div>
                  <div className={styles.formTitleSub}>
                    역량 진단서는 {questions.length}문항으로 이루어져 있습니다.
                  </div>
                </div>

                <div className={styles.formMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>제출기간</span>
                    <span className={styles.metaValue}>
                      {formatPeriod(startedAt, endedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.questionArea}>
              <div className={styles.questionList}>
                {questions.map((q) => (
                  <div key={q.id} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <input
                        className={styles.questionInput}
                        value={q.title}
                        readOnly
                        placeholder="질문"
                      />
                    </div>

                    {q.type === "SCALE" ? (
                      <div className={styles.scaleList}>
                        {q.scaleOptions.map((opt) => (
                          <div key={opt.id} className={styles.scaleRow}>
                            <div className={styles.scaleLeft}>
                              <span className={styles.scaleBullet} />
                              <span className={styles.scaleLabel}>{opt.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.shortRow}>
                        <input
                          className={styles.shortInput}
                          value={q.shortAnswer}
                          readOnly
                          placeholder="단답 텍스트..."
                        />
                      </div>
                    )}

                    {/* 상세 모달: 6CS 영역 숨김 */}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
