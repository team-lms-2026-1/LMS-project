"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import styles from "./DignosisDetailModal.module.css";
import { DignosisNonRespondentModal } from "./DignosisNonRespondentModal.client";
import { useDeptsDropdownOptions } from "@/features/dropdowns/depts/hooks";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { sendDiagnosisReminders } from "@/features/competencies/diagnosis/api/DiagnosisApi";
import type {
  DiagnosisScaleOption,
  DiagnosisQuestion,
  DiagnosisCsKey,
  DiagnosisResponseItem,
  DiagnosisDetailModalProps,
  DiagnosisDetailLegendItem,
  DiagnosisNonRespondentItem,
} from "@/features/competencies/diagnosis/api/types";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SCORE_OPTIONS = [1, 2, 3, 4, 5];
const CS_META: Array<{ key: DiagnosisCsKey; label: string; color: string }> = [
  { key: "criticalThinking", label: "Critical Thinking", color: "#ef4444" },
  { key: "character", label: "Character", color: "#f97316" },
  { key: "creativity", label: "Creativity", color: "#facc15" },
  { key: "communication", label: "Communication", color: "#22c55e" },
  { key: "collaboration", label: "Collaboration", color: "#2563eb" },
  { key: "citizenship", label: "Citizenship", color: "#8b5cf6" },
];
const LEGEND_DOT_CLASS: Record<DiagnosisCsKey, string> = {
  criticalThinking: styles.legendDotCriticalThinking,
  character: styles.legendDotCharacter,
  creativity: styles.legendDotCreativity,
  communication: styles.legendDotCommunication,
  collaboration: styles.legendDotCollaboration,
  citizenship: styles.legendDotConvergence,
};
const CS_INDEX = new Map<DiagnosisCsKey, number>(
  CS_META.map((item, index) => [item.key, index])
);
const CS_TICKS = CS_META.map((_, index) => index);
const RANGE_CAP_WIDTH = 0.18;

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

function formatScore(value?: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return String(Math.round(n));
}

function toDisplayText(value?: string, fallback = "-") {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
}

function formatGrade(
  value: string | undefined,
  options: { allLabel: string; gradeLabel: (grade: string) => string }
) {
  if (!value) return options.allLabel;
  const text = String(value).trim();
  if (!text) return options.allLabel;
  if (text.toUpperCase() === "ALL" || text === options.allLabel) return options.allLabel;
  if (/^\d+$/.test(text)) return options.gradeLabel(text);
  return text;
}

function createScaleOptions(scaleLabels: string[]): DiagnosisScaleOption[] {
  return scaleLabels.map((label, index) => ({
    id: makeId(),
    label,
    score: SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - index] ?? 1,
  }));
}

function createDefaultQuestion(scaleLabels: string[]): DiagnosisQuestion {
  return {
    id: makeId(),
    title: "",
    type: "SCALE",
    scaleOptions: createScaleOptions(scaleLabels),
    shortAnswer: "",
    csScores: {
      criticalThinking: 5,
      character: 5,
      communication: 5,
      collaboration: 5,
      creativity: 5,
      citizenship: 5,
    },
  };
}

function normalizeQuestions(
  questions: DiagnosisQuestion[] | undefined,
  scaleLabels: string[]
): DiagnosisQuestion[] {
  if (!questions || questions.length === 0) return [createDefaultQuestion(scaleLabels)];
  return questions.map((q) => ({
    id: q.id || makeId(),
    title: q.title ?? "",
    type: q.type ?? "SCALE",
    scaleOptions:
      q.scaleOptions && q.scaleOptions.length > 0
        ? q.scaleOptions.map((opt, idx) => ({
            id: opt.id || makeId(),
            label: opt.label ?? scaleLabels[idx] ?? "",
            score: opt.score ?? SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - idx] ?? 1,
          }))
        : createScaleOptions(scaleLabels),
    shortAnswer: q.shortAnswer ?? "",
    csScores: {
      criticalThinking: q.csScores?.criticalThinking ?? 5,
      character: q.csScores?.character ?? 5,
      communication: q.csScores?.communication ?? 5,
      collaboration: q.csScores?.collaboration ?? 5,
      creativity: q.csScores?.creativity ?? 5,
      citizenship:
        q.csScores?.citizenship ??
        (q.csScores as Record<string, number> | undefined)?.convergence ??
        5,
    },
  }));
}

export function DignosisDetailModal({
  open,
  onClose,
  value,
  onEdit,
  dignosisId,
  initialTab,
}: DiagnosisDetailModalProps) {
  const t = useI18n("competency.adminDiagnosis.detailModal");
  const scaleLabels = useMemo(
    () => [
      t("scaleLabels.stronglyAgree"),
      t("scaleLabels.agree"),
      t("scaleLabels.neutral"),
      t("scaleLabels.disagree"),
      t("scaleLabels.stronglyDisagree"),
    ],
    [t]
  );
  const [activeTab, setActiveTab] = useState<"QUESTION" | "ANSWER">("QUESTION");
  const [questions, setQuestions] = useState<DiagnosisQuestion[]>([
    createDefaultQuestion(scaleLabels),
  ]);
  const [nonRespondentOpen, setNonRespondentOpen] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const { options: deptOptionsRaw } = useDeptsDropdownOptions();
  const { options: semesterOptionsRaw } = useSemestersDropdownOptions();
  const deptOptions = useMemo(
    () => [{ value: "All", label: t("fallback.all") }, ...deptOptionsRaw],
    [deptOptionsRaw, t]
  );
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

  const responseStats = useMemo(() => value?.responseStats, [value]);
  const responseItems = responseStats?.items ?? [];
  const responseCount = responseStats?.totalResponses ?? 0;
  const nonRespondents = value?.nonRespondents ?? [];
  const deptLabel = useMemo(() => {
    const rawDeptValue =
      value?.deptValue ??
      (value as any)?.basicInfo?.deptId ??
      (value as any)?.deptId ??
      (value as any)?.departmentId ??
      (value as any)?.department?.deptId ??
      (value as any)?.department?.id;
    const fallbackName = toDisplayText(
      value?.deptName ??
        (value as any)?.basicInfo?.deptName ??
        (value as any)?.deptName ??
        (value as any)?.departmentName ??
        (value as any)?.department?.deptName ??
        (value as any)?.department?.name
    );
    if (rawDeptValue === undefined || rawDeptValue === null || String(rawDeptValue).trim() === "") {
      return fallbackName === "-" ? t("fallback.all") : fallbackName;
    }
    const deptValue = String(rawDeptValue);
    if (deptValue === "All" || deptValue.toUpperCase() === "ALL") return t("fallback.all");
    const matched = deptOptions.find((opt) => String(opt.value) === deptValue);
    return matched?.label ?? fallbackName;
  }, [deptOptions, t, value]);
  const semesterLabel = useMemo(() => {
    const rawSemesterId =
      value?.semesterId ??
      (value as any)?.basicInfo?.semesterId ??
      (value as any)?.semesterId ??
      (value as any)?.semester?.semesterId ??
      (value as any)?.semester?.id;
    const fallbackName = toDisplayText(
      value?.semesterName ??
        (value as any)?.basicInfo?.semesterName ??
        (value as any)?.semesterName ??
        (value as any)?.semester?.displayName ??
        (value as any)?.semester?.name
    );
    if (rawSemesterId === undefined || rawSemesterId === null || String(rawSemesterId).trim() === "") {
      return fallbackName;
    }
    const semesterValue = String(rawSemesterId);
    const matched = semesterOptionsRaw.find((opt) => String(opt.value) === semesterValue);
    return matched?.label ?? fallbackName;
  }, [semesterOptionsRaw, value]);
  const gradeLabel = formatGrade(value?.gradeValue ?? (value as any)?.basicInfo?.targetGrade ?? (value as any)?.grade ?? (value as any)?.gradeLevel, {
    allLabel: t("fallback.all"),
    gradeLabel: (grade) => t("gradeFormat", { grade }),
  });
  const statusText =
    value?.status ??
    (value as any)?.basicInfo?.status ??
    "";
  const isClosed = String(statusText).toUpperCase() === "CLOSED";
  const canOpenNonRespondents = Boolean(value);

  const pointsByKey = useMemo(() => {
    const map = new Map<
      DiagnosisCsKey,
      Array<{ x: number; category: string; score: number; name: string; key: DiagnosisCsKey }>
    >();
    responseItems.forEach((item) => {
      const x = CS_INDEX.get(item.key);
      if (x === undefined) return;
      map.set(
        item.key,
        item.points.map((p) => ({
          x,
          category: item.label,
          score: p.score,
          name: p.name,
          key: item.key,
        }))
      );
    });
    return map;
  }, [responseItems]);

  const distributionYAxis = useMemo(() => {
    if (responseItems.length === 0) return undefined;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    responseItems.forEach((item) => {
      const candidates = [
        item.min,
        item.max,
        item.avg,
        ...(item.points ?? []).map((p) => p.score),
      ];
      candidates.forEach((value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return;
        min = Math.min(min, n);
        max = Math.max(max, n);
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
    const range = max - min;
    const padding = range === 0 ? Math.max(Math.abs(max) * 0.1, 1) : range * 0.1;
    const paddedMin = min - padding;
    const paddedMax = max + padding;
    const step = 100;
    const minTick = Math.floor(paddedMin / step) * step;
    const maxTick = Math.ceil(paddedMax / step) * step;
    const ticks: number[] = [];
    for (let v = minTick; v <= maxTick; v += step) {
      ticks.push(v);
    }
    return { domain: [minTick, maxTick] as [number, number], ticks };
  }, [responseItems]);

  const legendItems = useMemo<DiagnosisDetailLegendItem[]>(() => {
    const map = new Map<DiagnosisCsKey, DiagnosisResponseItem>();
    responseItems.forEach((item) => map.set(item.key, item));
    return CS_META.map((meta) => {
      const item = map.get(meta.key);
      if (!item) {
        return { key: meta.key, label: meta.label, min: undefined, max: undefined, avg: undefined };
      }
      return { key: item.key, label: item.label, min: item.min, max: item.max, avg: item.avg };
    });
  }, [responseItems]);

  const ResponseTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0]?.payload as {
      name?: string;
      score?: number;
      category?: string;
      key?: DiagnosisCsKey;
    };
    if (!point) return null;
    const baseScore = Number(point.score);
    const candidates = point.key ? pointsByKey.get(point.key) ?? [] : [];
    const matched = Number.isFinite(baseScore)
      ? candidates.filter((p) => Math.abs(p.score - baseScore) < 0.0001)
      : [];
    const rows =
      matched.length > 0
        ? matched
        : [
            {
              name: point.name ?? t("fallback.student"),
              score: Number.isFinite(baseScore) ? baseScore : 0,
            },
          ];
    const unique = new Map<string, number>();
    rows.forEach((row) => {
      const name = row.name ?? t("fallback.student");
      if (!unique.has(name)) unique.set(name, row.score);
    });
    const list = Array.from(unique.entries()).map(([name, score]) => ({ name, score }));
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipTitle}>{point.category ?? t("fallback.competency")}</div>
        <div className={styles.tooltipMeta}>
          {t("scoreText", { score: formatScore(baseScore) })}
        </div>
        <div className={styles.tooltipList}>
          {list.map((row, index) => (
            <div key={`${row.name}-${index}`} className={styles.tooltipRow}>
              <span className={styles.tooltipName}>{row.name}</span>
              <span className={styles.tooltipScore}>
                {t("scoreText", { score: formatScore(row.score) })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab ?? "QUESTION");
    setQuestions(normalizeQuestions(value?.questions, scaleLabels));
  }, [initialTab, open, scaleLabels, value]);

  useEffect(() => {
    if (open) return;
    setNonRespondentOpen(false);
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleSendReminders = async (items: DiagnosisNonRespondentItem[]) => {
    if (!dignosisId) {
      toast.error("진단 ID를 확인할 수 없습니다.");
      return;
    }
    if (sendingReminders) return;

    setSendingReminders(true);
    try {
      const res: any = await sendDiagnosisReminders(dignosisId, {
        targetIds: [],
        sendToAllPending: true,
      });
      const sentCount = Number(res?.data?.sentCount ?? res?.sentCount ?? 0);
      if (Number.isFinite(sentCount) && sentCount > 0) {
        toast.success(`알림을 전송했습니다. (${sentCount}명)`);
      } else {
        toast.error("알림 대상이 없습니다.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "알림 전송에 실패했습니다.");
    } finally {
      setSendingReminders(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        closeOnBackdrop={false}
        closeOnEsc={false}
        size="lg"
        footer={
          <>
            {!isClosed && (
              <Button variant="primary" onClick={onEdit} disabled={!onEdit}>
                {t("buttons.edit")}
              </Button>
            )}
            <Button variant="secondary" onClick={handleClose}>
              {t("buttons.close")}
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
                {t("tabs.question")}
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === "ANSWER" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("ANSWER")}
              >
                {t("tabs.answer")}
              </button>
            </div>
          </div>

          {activeTab === "ANSWER" ? (
            <div className={styles.answerWrap}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryTitle}>{t("summary.title")}</div>
                <div className={styles.summaryCount}>
                  {t("summary.count", { count: responseCount })}
                </div>
                <button
                  type="button"
                  className={styles.summaryButton}
                  onClick={() => setNonRespondentOpen(true)}
                  disabled={!canOpenNonRespondents}
                >
                  {t("buttons.nonRespondents")}
                </button>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>{t("chart.title")}</h3>
                </div>
                <div className={styles.chartWrap}>
                  {responseItems.length === 0 ? (
                    <div className={styles.emptyAnswer}>{t("chart.empty")}</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={360}>
                      <ScatterChart margin={{ top: 10, right: 24, left: 0, bottom: 24 }}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="x"
                          type="number"
                          ticks={CS_TICKS}
                          tick={{ fontSize: 12 }}
                          interval={0}
                          domain={[-0.5, CS_META.length - 0.5]}
                          tickFormatter={(value) => {
                            const idx = Number(value);
                            return Number.isFinite(idx) ? CS_META[idx]?.label ?? "" : "";
                          }}
                          allowDecimals={false}
                        />
                        <YAxis
                          dataKey="score"
                          type="number"
                          tick={{ fontSize: 12 }}
                          domain={distributionYAxis?.domain ?? ["auto", "auto"]}
                          ticks={distributionYAxis?.ticks}
                          tickFormatter={(value: number) => String(Math.round(value))}
                          allowDecimals={false}
                          allowDataOverflow
                        />
                        <Tooltip content={<ResponseTooltip />} />
                        {responseItems.map((item) => (
                          <ReferenceLine
                            key={`range-${item.key}`}
                            stroke="#111827"
                            strokeWidth={2}
                            segment={[
                              { x: CS_INDEX.get(item.key) ?? 0, y: item.min },
                              { x: CS_INDEX.get(item.key) ?? 0, y: item.max },
                            ]}
                          />
                        ))}
                        {responseItems.map((item) => {
                          const x = CS_INDEX.get(item.key);
                          if (x === undefined) return null;
                          return (
                            <ReferenceLine
                              key={`cap-min-${item.key}`}
                              stroke="#111827"
                              strokeWidth={2}
                              segment={[
                                { x: x - RANGE_CAP_WIDTH, y: item.min },
                                { x: x + RANGE_CAP_WIDTH, y: item.min },
                              ]}
                            />
                          );
                        })}
                        {responseItems.map((item) => {
                          const x = CS_INDEX.get(item.key);
                          if (x === undefined) return null;
                          return (
                            <ReferenceLine
                              key={`cap-max-${item.key}`}
                              stroke="#111827"
                              strokeWidth={2}
                              segment={[
                                { x: x - RANGE_CAP_WIDTH, y: item.max },
                                { x: x + RANGE_CAP_WIDTH, y: item.max },
                              ]}
                            />
                          );
                        })}
                        {responseItems.map((item) => {
                          const points = pointsByKey.get(item.key) ?? [];
                          const color =
                            CS_META.find((c) => c.key === item.key)?.color ?? "#111827";
                          return (
                            <Scatter
                              key={`scatter-${item.key}`}
                              data={points}
                              fill={color}
                              fillOpacity={0.8}
                            />
                          );
                        })}
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {legendItems.length > 0 ? (
                  <div className={styles.legend}>
                    {legendItems.map((item) => {
                      const dotClass = LEGEND_DOT_CLASS[item.key];
                      return (
                        <div key={`legend-${item.key}`} className={styles.legendItem}>
                          <span className={`${styles.legendDot} ${dotClass ?? ""}`} />
                          <span className={styles.legendText}>
                            {t("legend.range", {
                              label: item.label,
                              min: formatScore(item.min),
                              max: formatScore(item.max),
                            })}
                            {Number.isFinite(item.avg)
                              ? t("legend.avg", { avg: formatScore(item.avg) })
                              : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.formCard}>
                <div className={styles.formHeader}>
                  <div className={styles.formTitle}>
                    <div className={styles.formTitleMain}>{t("form.titleMain")}</div>
                    <div className={styles.formTitleSub}>
                      {t("form.titleSub", { count: questions.length })}
                    </div>
                  </div>

                <div className={styles.formMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>{t("form.meta.semester")}</span>
                    <span className={styles.metaValue}>{semesterLabel}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>{t("form.meta.dept")}</span>
                    <span className={styles.metaValue}>{deptLabel}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>{t("form.meta.grade")}</span>
                    <span className={styles.metaValue}>{gradeLabel}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>{t("form.meta.period")}</span>
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
                          placeholder={t("placeholders.question")}
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
                            placeholder={t("placeholders.shortAnswer")}
                          />
                        </div>
                      )}

                      {/* 상세 모달: 6CS 영역 추가 */}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <DignosisNonRespondentModal
        open={nonRespondentOpen}
        onClose={() => setNonRespondentOpen(false)}
        deptName={deptLabel}
        items={nonRespondents}
        dignosisId={dignosisId}
        onSendEmail={handleSendReminders}
      />
    </>
  );
}


