"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";
import DignosisPageClient from "@/features/admin/competencies/diagnosis/components/list/DignosisPage.client";
import { DignosisDetailModal } from "./DignosisDetailModal.client";
import { fetchDiagnosisDetail, fetchDiagnosisDistribution } from "@/features/admin/competencies/diagnosis/api/DiagnosisApi";
import type {
  DiagnosisDetailValue,
  DiagnosisResponsePoint,
  DiagnosisResponseStats,
  DiagnosisResponseItem,
  DiagnosisCsKey,
  DiagnosisQuestion,
  DiagnosisQuestionType,
  DiagnosisNonRespondentItem,
  DiagnosisDetailPageProps,
} from "@/features/admin/competencies/diagnosis/api/types";

const SCORE_OPTIONS = [1, 2, 3, 4, 5];
const SCALE_LABELS = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree",
];
const CS_META: Array<{ key: DiagnosisCsKey; label: string }> = [
  { key: "criticalThinking", label: "Critical Thinking" },
  { key: "character", label: "Character" },
  { key: "creativity", label: "Creativity" },
  { key: "communication", label: "Communication" },
  { key: "collaboration", label: "Collaboration" },
  { key: "citizenship", label: "Citizenship" },
];

function toDateOnly(value?: string | number | Date | null) {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  if (typeof value === "number") {
    const ms = value > 2_000_000_000 ? value : value * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }

  const text = String(value).trim();
  if (!text) return "";

  if (/^\d{10,13}$/.test(text)) {
    const num = Number(text);
    if (Number.isFinite(num)) {
      const ms = text.length >= 13 ? num : num * 1000;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    }
  }

  if (text.includes("T")) return text.slice(0, 10);

  if (text.length >= 10) {
    const head = text.slice(0, 10);
    if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(head)) {
      return head.replace(/[./]/g, "-");
    }
  }

  return text;
}

function getByPath(obj: any, path: string) {
  if (!obj) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function pickFirstValue(obj: any, paths: string[]) {
  for (const p of paths) {
    const v = getByPath(obj, p);
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

function pickFirstString(obj: any, paths: string[]): string {
  const v = pickFirstValue(obj, paths);
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function parsePeriodText(value?: string) {
  if (!value) return { start: "", end: "" };
  const text = String(value);
  const matches = text.match(/\d{4}[./-]\d{2}[./-]\d{2}/g);
  if (matches && matches.length >= 2) {
    return { start: toDateOnly(matches[0]), end: toDateOnly(matches[1]) };
  }
  return { start: "", end: "" };
}

function toDisplayText(value: any, fallback = "-") {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
}

function toCsKey(raw?: string) {
  if (!raw) return undefined;
  const key = raw.toLowerCase();
  if (key.includes("critical") || key === "ct" || key === "c1") return "criticalThinking";
  if (key.includes("character") || key === "ch" || key === "c2") return "character";
  if (key.includes("creativity") || key === "cre" || key === "c5") return "creativity";
  if (key.includes("communication") || key === "com" || key === "c3") return "communication";
  if (key.includes("collaboration") || key === "col" || key === "c4") return "collaboration";
  if (key.includes("convergence") || key.includes("citizenship") || key === "conv" || key === "c6") {
    return "citizenship";
  }
  return undefined;
}

function normalizeResponseItem(key: DiagnosisCsKey, raw: any): DiagnosisResponseItem | null {
  if (!raw || typeof raw !== "object") return null;
  const label = CS_META.find((c) => c.key === key)?.label ?? key;
  const pointsRaw = raw?.points ?? raw?.scores ?? raw?.students ?? raw?.items ?? [];
  const points = Array.isArray(pointsRaw)
    ? pointsRaw
        .map((p: any, idx: number) => ({
          name: String(p?.name ?? p?.studentName ?? p?.id ?? `Student ${idx + 1}`),
          score: Number(p?.score ?? p?.value ?? p?.point ?? p?.avgScore ?? 0),
        }))
        .filter((p) => Number.isFinite(p.score))
    : [];

  const min = Number(raw?.min ?? raw?.minimum ?? raw?.minScore);
  const max = Number(raw?.max ?? raw?.maximum ?? raw?.maxScore);
  const avg = Number(raw?.avg ?? raw?.average ?? raw?.mean);
  const computedMin = points.length > 0 ? Math.min(...points.map((p) => p.score)) : 0;
  const computedMax = points.length > 0 ? Math.max(...points.map((p) => p.score)) : 0;
  const computedAvg =
    points.length > 0
      ? points.reduce((acc, cur) => acc + cur.score, 0) / points.length
      : 0;

  return {
    key,
    label,
    min: Number.isFinite(min) ? min : computedMin,
    max: Number.isFinite(max) ? max : computedMax,
    avg: Number.isFinite(avg) ? avg : computedAvg,
    points,
  };
}

function normalizeResponseStats(raw: any): DiagnosisResponseStats | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const base =
    raw?.responseStats ??
    raw?.answerStats ??
    raw?.resultStats ??
    raw?.statistics ??
    raw?.stats ??
    raw?.responses;

  if (!base || typeof base !== "object") return undefined;

  const totalRaw =
    base?.totalResponses ??
    base?.respondentCount ??
    base?.responseCount ??
    base?.totalCount ??
    base?.count;

  const itemsRaw = base?.items ?? base?.csStats ?? base?.competencies ?? base?.distribution ?? base;
  let items: DiagnosisResponseItem[] = [];

  if (Array.isArray(itemsRaw)) {
    items = itemsRaw
      .map((item: any) => {
        const key =
          toCsKey(item?.key ?? item?.code ?? item?.name ?? item?.label) ??
          CS_META[0]?.key;
        return key ? normalizeResponseItem(key, item) : null;
      })
      .filter((v): v is DiagnosisResponseItem => Boolean(v));
  } else if (itemsRaw && typeof itemsRaw === "object") {
    items = Object.entries(itemsRaw as Record<string, any>)
      .map(([k, v]) => {
        const value = v as any;
        const key = toCsKey(k) ?? toCsKey(value?.key ?? value?.name ?? value?.label);
        return key ? normalizeResponseItem(key, value) : null;
      })
      .filter((v): v is DiagnosisResponseItem => Boolean(v));
  }

  if (items.length === 0) return undefined;

  const ordered = CS_META.map((c) => items.find((i) => i.key === c.key)).filter(
    (v): v is DiagnosisResponseItem => Boolean(v)
  );

  const uniqueNames = new Set<string>();
  ordered.forEach((item) => item.points.forEach((p) => uniqueNames.add(p.name)));
  const totalResponses = Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : uniqueNames.size;

  return {
    totalResponses,
    items: ordered,
  };
}

function normalizeDistributionStats(raw: any): DiagnosisResponseStats | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const base = raw?.data ?? raw;
  const list = base?.distribution ?? base?.items ?? base?.data ?? base?.scores ?? [];
  if (!Array.isArray(list) || list.length === 0) return undefined;

  const grouped = new Map<DiagnosisCsKey, DiagnosisResponsePoint[]>();
  const uniqueNames = new Set<string>();

  list.forEach((item: any, idx: number) => {
    const key = toCsKey(item?.competencyCode ?? item?.competency ?? item?.code ?? item?.key);
    if (!key) return;
    const score = Number(item?.score ?? item?.value ?? item?.point ?? item?.avgScore);
    if (!Number.isFinite(score)) return;
    const name = String(item?.studentName ?? item?.name ?? item?.studentHash ?? `Student ${idx + 1}`);

    uniqueNames.add(name);
    const points = grouped.get(key) ?? [];
    points.push({ name, score });
    grouped.set(key, points);
  });

  const items = CS_META.map((meta) => {
    const points = grouped.get(meta.key) ?? [];
    if (points.length === 0) return null;
    const scores = points.map((p) => p.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = scores.reduce((acc, cur) => acc + cur, 0) / scores.length;

    return {
      key: meta.key,
      label: meta.label,
      min,
      max,
      avg,
      points,
    } as DiagnosisResponseItem;
  }).filter((v): v is DiagnosisResponseItem => Boolean(v));

  if (items.length === 0) return undefined;

  const totalRaw =
    base?.totalResponseCount ??
    base?.totalResponses ??
    base?.respondentCount ??
    base?.responseCount ??
    base?.count;

  const totalResponses = Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : uniqueNames.size;

  return { totalResponses, items };
}

function isNonRespondentStatus(value?: string | null) {
  if (!value) return false;
  const status = String(value).toUpperCase();
  return (
    status === "PENDING" ||
    status === "NOT_SUBMITTED" ||
    status === "NOT_SUBMIT" ||
    status === "NOT_RESPONSE" ||
    status === "NOT_RESPONDED" ||
    status === "UNSUBMITTED" ||
    status === "UNANSWERED" ||
    status === "NOT_ANSWERED"
  );
}

function normalizeNonRespondents(raw: any): DiagnosisNonRespondentItem[] {
  if (!raw || typeof raw !== "object") return [];

  const base =
    raw?.nonRespondents ??
    raw?.nonRespondentStudents ??
    raw?.unsubmittedStudents ??
    raw?.notSubmittedStudents ??
    raw?.pendingStudents ??
    raw?.noResponseStudents ??
    raw?.targets ??
    raw?.targetStudents ??
    raw?.students ??
    raw?.items;

  const list = Array.isArray(base)
    ? base
    : Array.isArray(base?.data)
      ? base.data
      : Array.isArray(base?.items)
        ? base.items
        : [];

  if (!Array.isArray(list) || list.length === 0) return [];

  const hasStatus = list.some((item) => item && (item.status ?? item.submitStatus ?? item.responseStatus) !== undefined);
  const filtered = hasStatus
    ? list.filter((item) => isNonRespondentStatus(item?.status ?? item?.submitStatus ?? item?.responseStatus))
    : list;

  return filtered.map((item, index) => ({
    id: item?.id ?? item?.studentId ?? item?.accountId ?? item?.studentNumber ?? index,
    studentNumber: toDisplayText(
      item?.studentNumber ?? item?.studentNo ?? item?.studentId ?? item?.id ?? ""
    ),
    name: toDisplayText(item?.name ?? item?.studentName ?? item?.fullName ?? ""),
    email: toDisplayText(item?.email ?? item?.studentEmail ?? item?.mail ?? ""),
  }));
}

function toGradeValue(raw?: string | number) {
  if (raw === undefined || raw === null) return "";
  const text = String(raw).trim();
  if (!text) return "";
  if (text.toUpperCase() === "ALL" || text === "전체") return "ALL";
  const match = text.match(/\d/);
  return match ? match[0] : text;
}

function createScaleOptions() {
  return SCALE_LABELS.map((label, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    score: SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - index] ?? 1,
  }));
}

function pickScore(...values: any[]) {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 5;
}

function pickText(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function buildScaleOptionsFromFields(q: any, idx: number) {
  const labels = [q?.label1, q?.label2, q?.label3, q?.label4, q?.label5];
  const scores = [q?.score1, q?.score2, q?.score3, q?.score4, q?.score5];
  const hasAny =
    labels.some((v) => v !== undefined && v !== null && String(v).trim() !== "") ||
    scores.some((v) => Number.isFinite(Number(v)));
  if (!hasAny) return undefined;
  return labels.map((label, oidx) => ({
    id: String(q?.optionId ?? `${idx}-${oidx}`),
    label: label ?? SCALE_LABELS[oidx] ?? "",
    score: Number.isFinite(Number(scores[oidx]))
      ? Number(scores[oidx])
      : SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - oidx] ?? 1,
  }));
}

function mapQuestions(raw?: any[]): DiagnosisQuestion[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((q, idx) => {
    const type = (q?.type ?? q?.questionType ?? "SCALE") as DiagnosisQuestionType;
    const optionsRaw = Array.isArray(q?.scaleOptions)
      ? q.scaleOptions
      : Array.isArray(q?.options)
        ? q.options
        : [];

    const scaleOptionsFromFields = buildScaleOptionsFromFields(q, idx);
    const scaleOptions =
      optionsRaw.length > 0
        ? optionsRaw.map((opt: any, oidx: number) => ({
            id: String(opt?.id ?? opt?.optionId ?? `${idx}-${oidx}`),
            label: opt?.label ?? opt?.text ?? opt?.optionText ?? SCALE_LABELS[oidx] ?? "",
            score: Number(opt?.score ?? opt?.value ?? SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - oidx] ?? 1),
          }))
        : scaleOptionsFromFields ?? createScaleOptions();

    const cs = q?.csScores ?? q?.csScore ?? {};
    const weights = q?.weights ?? q?.weight ?? {};

    return {
      id: String(q?.id ?? q?.questionId ?? idx),
      title: q?.title ?? q?.questionTitle ?? q?.text ?? "",
      type: type === "SHORT" ? "SHORT" : "SCALE",
      scaleOptions,
      shortAnswer: pickText(
        q?.shortAnswer,
        q?.shortAnswerKey,
        q?.short_answer_key,
        q?.answer
      ),
      csScores: {
        criticalThinking: pickScore(
          cs?.criticalThinking,
          cs?.ct,
          weights?.C1,
          weights?.c1,
          q?.c1,
          q?.C1
        ),
        character: pickScore(
          cs?.character,
          cs?.ch,
          weights?.C2,
          weights?.c2,
          q?.c2,
          q?.C2
        ),
        communication: pickScore(
          cs?.communication,
          cs?.com,
          weights?.C3,
          weights?.c3,
          q?.c3,
          q?.C3
        ),
        collaboration: pickScore(
          cs?.collaboration,
          cs?.col,
          weights?.C4,
          weights?.c4,
          q?.c4,
          q?.C4
        ),
        creativity: pickScore(
          cs?.creativity,
          cs?.cre,
          weights?.C5,
          weights?.c5,
          q?.c5,
          q?.C5
        ),
        citizenship: pickScore(
          cs?.citizenship,
          cs?.convergence,
          cs?.conv,
          weights?.C6,
          weights?.c6,
          q?.c6,
          q?.C6
        ),
      },
    };
  });
}

function unwrapDetail(raw: any) {
  if (!raw || typeof raw !== "object") return raw;
  const directKeys = ["startedAt", "endedAt", "startDate", "endDate", "period", "submitPeriod", "submissionPeriod"];
  if (directKeys.some((key) => key in raw)) return raw;

  const candidate =
    raw?.data ?? raw?.result ?? raw?.diagnosis ?? raw?.item ?? raw?.detail ?? raw?.payload ?? raw?.response;

  if (candidate && typeof candidate === "object") {
    if ("data" in candidate && candidate.data && typeof candidate.data === "object") {
      return candidate.data;
    }
    return candidate;
  }

  return raw;
}

// 상세값 전처리 (중복/미설정/빈값 정리)
function mapDetailValue(raw: any): DiagnosisDetailValue {
  const base = unwrapDetail(raw) ?? raw;
  const info = base?.basicInfo ?? base?.diagnosis ?? base?.detail ?? base;

  const questionsRaw = base?.questions ?? info?.questions;

  const deptId = info?.deptId ?? info?.departmentId ?? base?.deptId ?? base?.departmentId;
  const deptName = info?.deptName ?? info?.departmentName ?? base?.deptName ?? base?.departmentName;
  const semesterId =
    pickFirstValue(info, ["semesterId", "semester.semesterId", "semester.id"]) ??
    pickFirstValue(base, ["semesterId", "semester.semesterId", "semester.id"]);
  const semesterName =
    pickFirstString(info, [
      "semesterName",
      "semester.displayName",
      "semester.name",
      "semester.semesterName",
      "semester.title",
    ]) ||
    pickFirstString(base, [
      "semesterName",
      "semester.displayName",
      "semester.name",
      "semester.semesterName",
      "semester.title",
    ]);

  const deptValue =
    deptId !== undefined && deptId !== null
      ? String(deptId)
      : deptName === "All" || deptName === "전체"
        ? "All"
        : "";

  // 1) 직접 필드 경로로 시작/종료 값 찾기
  const directStart = pickFirstValue(base, [
    "startedAt",
    "startAt",
    "startDate",
    "basicInfo.startedAt",
    "basicInfo.startAt",
    "basicInfo.startDate",
    "period.startedAt",
    "period.startAt",
    "period.startDate",
    "submissionPeriod.startedAt",
    "submissionPeriod.startAt",
    "submissionPeriod.startDate",
  ]);

  const directEnd = pickFirstValue(base, [
    "endedAt",
    "endAt",
    "endDate",
    "basicInfo.endedAt",
    "basicInfo.endAt",
    "basicInfo.endDate",
    "period.endedAt",
    "period.endAt",
    "period.endDate",
    "submissionPeriod.endedAt",
    "submissionPeriod.endAt",
    "submissionPeriod.endDate",
  ]);

  // 2) "YYYY.MM.DD ~ YYYY.MM.DD" 같은 텍스트 period 파싱
  const periodText =
    pickFirstString(info, [
      "period",
      "submitPeriod",
      "submissionPeriod",
      "periodText",
      "submissionRange",
      "dateRange",
      "datePeriod",
      "diagnosisPeriod",
    ]) ||
    pickFirstString(base, [
      "period",
      "submitPeriod",
      "submissionPeriod",
      "periodText",
      "submissionRange",
      "dateRange",
      "datePeriod",
      "diagnosisPeriod",
    ]);

  const parsed = parsePeriodText(periodText);

  const startedAt = toDateOnly(directStart) || parsed.start || "";
  const endedAt = toDateOnly(directEnd) || parsed.end || "";
  const nonRespondents = normalizeNonRespondents(base);

  return {
    responseStats: normalizeResponseStats(base),
    nonRespondents,
    deptName: deptName ? String(deptName) : undefined,
    deptValue,
    gradeValue: toGradeValue(
      info?.targetGrade ?? info?.grade ?? info?.gradeLevel ?? base?.targetGrade ?? base?.grade ?? base?.gradeLevel
    ),
    semesterId:
      semesterId !== undefined && semesterId !== null && String(semesterId).trim() !== ""
        ? Number(semesterId)
        : undefined,
    semesterName: semesterName ? String(semesterName) : undefined,
    startedAt,
    endedAt,
    status: info?.status ?? base?.status ?? "DRAFT",
    questions: mapQuestions(questionsRaw),
  };
}

export default function DignosisDetailPageClient({ dignosisId }: DiagnosisDetailPageProps) {
  const t = useI18n("competency.adminDiagnosis.detailPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState<DiagnosisDetailValue | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const encodedId = useMemo(() => encodeURIComponent(String(dignosisId)), [dignosisId]);

  const fallbackStartedAt = useMemo(
    () => toDateOnly(searchParams?.get("startedAt") ?? searchParams?.get("start")),
    [searchParams]
  );
  const fallbackEndedAt = useMemo(
    () => toDateOnly(searchParams?.get("endedAt") ?? searchParams?.get("end")),
    [searchParams]
  );
  const initialTab = useMemo(() => {
    const raw = (searchParams?.get("tab") ?? "").toUpperCase();
    return raw === "ANSWER" ? "ANSWER" : "QUESTION";
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    setError(null);

    (async () => {
      try {
        const [detailRes, distRes] = await Promise.all([
          fetchDiagnosisDetail(dignosisId),
          fetchDiagnosisDistribution(dignosisId).catch(() => null),
        ]);
        const raw = (detailRes as any)?.data ?? detailRes ?? {};
        if (!alive) return;

        const distRaw = distRes ? (distRes as any)?.data ?? distRes : null;
        const distStats = normalizeDistributionStats(distRaw);

        const mapped = mapDetailValue(raw);

        // 임시 백엔드가 기간 값을 기본 정보에만 주는 경우 대비
        const rawInfo = (raw as any)?.basicInfo ?? (raw as any)?.diagnosis ?? (raw as any)?.detail ?? raw;
        const rawStartedAt = toDateOnly(rawInfo?.startedAt ?? rawInfo?.startDate ?? rawInfo?.startAt);
        const rawEndedAt = toDateOnly(rawInfo?.endedAt ?? rawInfo?.endDate ?? rawInfo?.endAt);

        setValue({
          ...mapped,
          responseStats: distStats ?? mapped.responseStats,
          startedAt: mapped.startedAt || rawStartedAt || fallbackStartedAt,
          endedAt: mapped.endedAt || rawEndedAt || fallbackEndedAt,
        });
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? t("messages.loadFailed"));
      }
    })();

    return () => {
      alive = false;
    };
  }, [dignosisId, fallbackEndedAt, fallbackStartedAt, t]);

  const handleClose = useCallback(() => {
    router.push("/admin/competencies/dignosis");
  }, [router]);

  const handleEdit = useCallback(() => {
    router.push(`/admin/competencies/dignosis/${encodedId}/edit`);
  }, [router, encodedId]);

  useEffect(() => {
    if (!error) return;
    window.alert(error);
  }, [error]);

  return (
    <>
      <DignosisPageClient />
      <DignosisDetailModal
        open
        onClose={handleClose}
        onEdit={handleEdit}
        value={value}
        dignosisId={dignosisId}
        initialTab={initialTab}
      />
    </>
  );
}

