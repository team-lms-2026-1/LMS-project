"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useDeptsDropdownOptions } from "@/features/dropdowns/depts/hooks";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
import toast from "react-hot-toast";
import styles from "./DignosisEditModal.module.css";
import type {
  DiagnosisQuestionType,
  DiagnosisCsKey,
  DiagnosisScaleOption,
  DiagnosisQuestion,
  DiagnosisCreateQuestionPayload,
  DiagnosisUpsertPayload,
  DiagnosisEditModalProps,
} from "@/features/competencies/diagnosis/api/types";

const SCORE_OPTIONS = [1, 2, 3, 4, 5];
const SCALE_LABELS = ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "매우 그렇지 않다"];
const CS_LABELS: Array<{ key: DiagnosisCsKey; label: string }> = [
  { key: "criticalThinking", label: "Critical Thinking" },
  { key: "character", label: "Character" },
  { key: "communication", label: "Communication" },
  { key: "collaboration", label: "Collaboration" },
  { key: "creativity", label: "Creativity" },
  { key: "convergence", label: "Convergence" },
];

const QUESTION_TYPE_OPTIONS = [
  { value: "SCALE", label: "척도" },
  { value: "SHORT", label: "단답형" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "DRAFT" },
  { value: "OPEN", label: "OPEN" },
  { value: "CLOSED", label: "CLOSED" },
];

const GRADE_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "1", label: "1학년" },
  { value: "2", label: "2학년" },
  { value: "3", label: "3학년" },
  { value: "4", label: "4학년" },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function serializeQuestions(questions: DiagnosisQuestion[]) {
  return JSON.stringify(
    questions.map((q) => ({
      title: q.title ?? "",
      type: q.type ?? "SCALE",
      shortAnswer: q.shortAnswer ?? "",
      scaleOptions: (q.scaleOptions ?? []).map((opt) => ({
        label: opt.label ?? "",
        score: opt.score ?? 0,
      })),
      csScores: {
        criticalThinking: q.csScores?.criticalThinking ?? 0,
        character: q.csScores?.character ?? 0,
        communication: q.csScores?.communication ?? 0,
        collaboration: q.csScores?.collaboration ?? 0,
        creativity: q.csScores?.creativity ?? 0,
        convergence: q.csScores?.convergence ?? 0,
      },
    }))
  );
}

function toNumber(value: string, fallback: number = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toDateOnly(value?: string) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (text.includes("T")) return text.slice(0, 10);
  return text.slice(0, 10);
}

function toTimeOnly(value?: string, fallback: string = "09:00") {
  if (!value) return fallback;
  const text = String(value).trim();
  if (!text) return fallback;
  if (text.includes("T")) {
    const time = text.split("T")[1]?.slice(0, 5) ?? "";
    return /^\d{2}:\d{2}$/.test(time) ? time : fallback;
  }
  return fallback;
}

function toDateTime(dateValue: string, timeValue: string) {
  if (!dateValue) return "";
  if (dateValue.includes("T")) return dateValue;
  const time = /^\d{2}:\d{2}$/.test(timeValue) ? timeValue : "00:00";
  return `${dateValue}T${time}:00`;
}

function buildCreateQuestions(questions: DiagnosisQuestion[]): DiagnosisCreateQuestionPayload[] {
  return questions.map((q, index) => {
    const scale = q.scaleOptions ?? [];
    const base = {
      order: index + 1,
      type: q.type,
      text: q.title,
      c1: q.csScores.criticalThinking,
      c2: q.csScores.character,
      c3: q.csScores.communication,
      c4: q.csScores.collaboration,
      c5: q.csScores.creativity,
      c6: q.csScores.convergence,
    };

    if (q.type === "SHORT") {
      return {
        ...base,
        shortAnswerKey: q.shortAnswer,
      };
    }

    return {
      ...base,
      label1: scale[0]?.label ?? "",
      score1: scale[0]?.score ?? 0,
      label2: scale[1]?.label ?? "",
      score2: scale[1]?.score ?? 0,
      label3: scale[2]?.label ?? "",
      score3: scale[2]?.score ?? 0,
      label4: scale[3]?.label ?? "",
      score4: scale[3]?.score ?? 0,
      label5: scale[4]?.label ?? "",
      score5: scale[4]?.score ?? 0,
    };
  });
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

export function DignosisEditModal({
  open,
  onClose,
  initialValue,
  onSubmit,
  dignosisId,
}: DiagnosisEditModalProps) {
  const router = useRouter();
  const { options: deptOptionsRaw, loading: deptLoading } = useDeptsDropdownOptions();
  const { options: semesterOptionsRaw, loading: semesterLoading } = useSemestersDropdownOptions();
  const deptOptions = useMemo(
    () => [{ value: "All", label: "전체" }, ...deptOptionsRaw],
    [deptOptionsRaw]
  );

  const encodedId = useMemo(
    () =>
      dignosisId !== undefined && dignosisId !== null
        ? encodeURIComponent(String(dignosisId))
        : "",
    [dignosisId]
  );

  const [activeTab, setActiveTab] = useState<"QUESTION" | "ANSWER">("QUESTION");
  const [title, setTitle] = useState("");
  const [semesterValue, setSemesterValue] = useState("");
  const [startedTime, setStartedTime] = useState("09:00");
  const [endedTime, setEndedTime] = useState("18:00");
  const [deptValue, setDeptValue] = useState("All");
  const [gradeValue, setGradeValue] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [questions, setQuestions] = useState<DiagnosisQuestion[]>([createDefaultQuestion()]);
  const [closeSignal, setCloseSignal] = useState(0);
  const initialSnapshotRef = useRef<{
    status: string;
    title: string;
    semesterValue: string;
    deptValue: string;
    gradeValue: string;
    startedAt: string;
    endedAt: string;
    startedTime: string;
    endedTime: string;
    questions: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveTab("QUESTION");
    setTitle(initialValue?.title ?? "");
    setSemesterValue(initialValue?.semesterId !== undefined ? String(initialValue?.semesterId) : "");
    setDeptValue(initialValue?.deptValue ?? "All");
    setGradeValue(initialValue?.gradeValue ?? "");
    setStatus(initialValue?.status ?? "DRAFT");
    setStartedAt(toDateOnly(initialValue?.startedAt));
    setEndedAt(toDateOnly(initialValue?.endedAt));
    const nextStartedTime =
      initialValue?.startedTime ?? toTimeOnly(initialValue?.startedAt, "09:00");
    const nextEndedTime =
      initialValue?.endedTime ?? toTimeOnly(initialValue?.endedAt, "18:00");
    setStartedTime(nextStartedTime);
    setEndedTime(nextEndedTime);
    const normalizedQuestions = normalizeQuestions(initialValue?.questions);
    setQuestions(normalizedQuestions);
    initialSnapshotRef.current = {
      status: String(initialValue?.status ?? "DRAFT").toUpperCase(),
      title: (initialValue?.title ?? "").trim(),
      semesterValue:
        initialValue?.semesterId !== undefined ? String(initialValue?.semesterId) : "",
      deptValue: initialValue?.deptValue ?? "All",
      gradeValue: initialValue?.gradeValue ?? "",
      startedAt: toDateOnly(initialValue?.startedAt),
      endedAt: toDateOnly(initialValue?.endedAt),
      startedTime: nextStartedTime,
      endedTime: nextEndedTime,
      questions: serializeQuestions(normalizedQuestions),
    };
  }, [open, initialValue]);

  const canAddQuestion = status !== "CLOSED";

  const updateQuestion = (id: string, updater: (q: DiagnosisQuestion) => DiagnosisQuestion) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updater(q) : q)));
  };

  const handleChangeType = (id: string, nextType: DiagnosisQuestionType) => {
    updateQuestion(id, (q) => ({
      ...q,
      type: nextType,
      scaleOptions: q.scaleOptions.length > 0 ? q.scaleOptions : createScaleOptions(),
    }));
  };

  const handleChangeScaleScore = (qid: string, optId: string, score: number) => {
    updateQuestion(qid, (q) => ({
      ...q,
      scaleOptions: q.scaleOptions.map((opt) =>
        opt.id === optId ? { ...opt, score } : opt
      ),
    }));
  };

  const handleChangeCsScore = (qid: string, key: DiagnosisCsKey, score: number) => {
    updateQuestion(qid, (q) => ({
      ...q,
      csScores: { ...q.csScores, [key]: score },
    }));
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createDefaultQuestion()]);
  };

  const handleCopyQuestion = (qid: string) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === qid);
      if (index < 0) return prev;
      const base = prev[index];
      const copy: DiagnosisQuestion = {
        ...base,
        id: makeId(),
        scaleOptions: base.scaleOptions.map((opt) => ({ ...opt, id: makeId() })),
        csScores: { ...base.csScores },
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const handleDeleteQuestion = (qid: string) => {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((q) => q.id !== qid);
    });
  };

  const handleClose = () => {
    setCloseSignal((v) => v + 1);
    onClose();
  };

  const handleAnswerTab = () => {
    if (encodedId) {
      router.push(`/admin/competencies/dignosis/${encodedId}?tab=ANSWER`);
      return;
    }
    setActiveTab("ANSWER");
  };

  const handleSubmit = async () => {
    const initialSnapshot = initialSnapshotRef.current;
    const currentStatus = String(status).toUpperCase();
    if (initialSnapshot?.status === "OPEN") {
      const hasOtherChanges =
        initialSnapshot.title !== title.trim() ||
        initialSnapshot.semesterValue !== semesterValue ||
        initialSnapshot.deptValue !== deptValue ||
        initialSnapshot.gradeValue !== gradeValue ||
        initialSnapshot.startedAt !== startedAt ||
        initialSnapshot.endedAt !== endedAt ||
        initialSnapshot.startedTime !== startedTime ||
        initialSnapshot.endedTime !== endedTime ||
        initialSnapshot.questions !== serializeQuestions(questions);

      if (hasOtherChanges) {
        toast.error("OPEN상태에서는 변경 불가능합니다.");
        return;
      }
    }

    if (!title.trim()) {
      window.alert("제목을 입력해 주세요.");
      return;
    }
    if (!semesterValue) {
      window.alert("학기를 선택해 주세요.");
      return;
    }
    if (!deptValue || deptValue === "All") {
      window.alert("학과를 선택해 주세요.");
      return;
    }
    if (!gradeValue || gradeValue === "ALL") {
      window.alert("학년을 선택해 주세요.");
      return;
    }
    if (!startedAt || !endedAt) {
      window.alert("기간을 선택해 주세요.");
      return;
    }

    const shouldSendQuestions = status === "DRAFT";
    const payload: DiagnosisUpsertPayload = {
      title: title.trim(),
      semesterId: toNumber(semesterValue),
      targetGrade: toNumber(gradeValue),
      deptId: toNumber(deptValue),
      startedAt: toDateTime(startedAt, startedTime),
      endedAt: toDateTime(endedAt, endedTime),
      status,
      questions: shouldSendQuestions ? buildCreateQuestions(questions) : undefined,
    };
    try {
      if (onSubmit) await onSubmit(payload);
    } catch {
      return;
    }
    setCloseSignal((v) => v + 1);
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
          <Button variant="primary" onClick={handleSubmit}>
            수정
          </Button>
          <Button variant="danger" onClick={handleClose}>
            취소
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
              onClick={handleAnswerTab}
            >
              응답
            </button>
          </div>

          <div className={styles.statusWrap}>
            <Dropdown
              value={status}
              options={STATUS_OPTIONS}
              placeholder="상태"
              onChange={setStatus}
              className={styles.statusDropdown}
            />
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

                <div className={styles.filters}>
                  <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>제목</span>
                    <input
                      className={styles.filterInput}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목"
                    />
                  </div>

                  <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>학기</span>
                    <Dropdown
                      value={semesterValue}
                      options={semesterOptionsRaw}
                      placeholder="학기"
                      loading={semesterLoading}
                      onChange={setSemesterValue}
                      className={styles.filterDropdown}
                    />
                  </div>
                  <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>학과</span>
                    <Dropdown
                      value={deptValue}
                      options={deptOptions}
                      placeholder="학과"
                      loading={deptLoading}
                      onChange={setDeptValue}
                      className={styles.filterDropdown}
                    />
                  </div>

                  <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>학년</span>
                    <Dropdown
                      value={gradeValue}
                      options={GRADE_OPTIONS}
                      placeholder="학년"
                      onChange={setGradeValue}
                      className={styles.filterDropdown}
                    />
                  </div>

                  <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>제출기간</span>
                    <div className={styles.dateRange}>
                      <DatePickerInput
                        value={startedAt}
                        onChange={setStartedAt}
                        placeholder="시작일"
                        className={styles.dateInput}
                        closeSignal={closeSignal}
                      />
                      <input
                        type="time"
                        className={styles.timeInput}
                        value={startedTime}
                        onChange={(e) => setStartedTime(e.target.value)}
                      />
                      <span className={styles.dateSep}>~</span>
                      <DatePickerInput
                        value={endedAt}
                        onChange={setEndedAt}
                        placeholder="종료일"
                        min={startedAt || undefined}
                        className={styles.dateInput}
                        closeSignal={closeSignal}
                      />
                      <input
                        type="time"
                        className={styles.timeInput}
                        value={endedTime}
                        onChange={(e) => setEndedTime(e.target.value)}
                      />
                    </div>
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
                        onChange={(e) =>
                          updateQuestion(q.id, (prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="질문"
                      />
                      <select
                        className={styles.typeSelect}
                        value={q.type}
                        onChange={(e) =>
                          handleChangeType(q.id, e.target.value as DiagnosisQuestionType)
                        }
                      >
                        {QUESTION_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {q.type === "SCALE" ? (
                      <div className={styles.scaleList}>
                        {q.scaleOptions.map((opt) => (
                          <div key={opt.id} className={styles.scaleRow}>
                            <div className={styles.scaleLeft}>
                              <span className={styles.scaleBullet} />
                              <span className={styles.scaleLabel}>{opt.label}</span>
                            </div>
                            <select
                              className={styles.scoreSelect}
                              value={opt.score}
                              onChange={(e) =>
                                handleChangeScaleScore(q.id, opt.id, Number(e.target.value))
                              }
                            >
                              {SCORE_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}점
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.shortRow}>
                        <span className={styles.shortLabel}>정답:</span>
                        <input
                          className={styles.shortInput}
                          value={q.shortAnswer}
                          onChange={(e) =>
                            updateQuestion(q.id, (prev) => ({ ...prev, shortAnswer: e.target.value }))
                          }
                          placeholder="단답 텍스트..."
                        />
                      </div>
                    )}

                    <div className={styles.csRow}>
                      <div className={styles.csGrid}>
                        {CS_LABELS.map((cs) => (
                          <div key={cs.key} className={styles.csItem}>
                            <span className={styles.csLabel}>{cs.label}</span>
                            <select
                              className={styles.csSelect}
                              value={q.csScores[cs.key]}
                              onChange={(e) =>
                                handleChangeCsScore(q.id, cs.key, Number(e.target.value))
                              }
                            >
                              {SCORE_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}점
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      <div className={styles.csActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => handleCopyQuestion(q.id)}
                          aria-label="copy question"
                        >
                          <svg viewBox="0 0 24 24" className={styles.iconSvg} fill="none">
                            <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => handleDeleteQuestion(q.id)}
                          aria-label="delete question"
                        >
                          <svg viewBox="0 0 24 24" className={styles.iconSvg} fill="none">
                            <path
                              d="M6 7h12M10 7v10m4-10v10M9 4h6l1 2H8l1-2Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <rect x="6" y="7" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {canAddQuestion && (
                <button type="button" className={styles.addButton} onClick={handleAddQuestion}>
                  +
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
