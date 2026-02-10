"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getJson, patchJson } from "@/lib/http";
import DignosisPageClient from "@/features/competencies/diagnosis/components/list/DignosisPage.client";
import { DignosisEditModal } from "./DignosisEditModal.client";
import type {
  DiagnosisFormValue,
  DiagnosisQuestion,
  DiagnosisQuestionType,
  DiagnosisDetailResponse,
} from "@/features/competencies/diagnosis/api/types";

type Props = {
  dignosisId: string;
};


const SCORE_OPTIONS = [1, 2, 3, 4, 5];
const SCALE_LABELS = ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "매우 그렇지 않다"];

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

function parsePeriodText(value?: string) {
  if (!value) return { start: "", end: "" };
  const text = String(value);
  const matches = text.match(/\d{4}[./-]\d{2}[./-]\d{2}/g);
  if (matches && matches.length >= 2) {
    return { start: toDateOnly(matches[0]), end: toDateOnly(matches[1]) };
  }
  return { start: "", end: "" };
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

function mapQuestions(raw?: any[]): DiagnosisQuestion[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((q, idx) => {
    const type = (q?.type ?? q?.questionType ?? "SCALE") as DiagnosisQuestionType;
    const optionsRaw = Array.isArray(q?.scaleOptions)
      ? q.scaleOptions
      : Array.isArray(q?.options)
        ? q.options
        : [];

    const scaleOptions =
      optionsRaw.length > 0
        ? optionsRaw.map((opt: any, oidx: number) => ({
            id: String(opt?.id ?? opt?.optionId ?? `${idx}-${oidx}`),
            label: opt?.label ?? opt?.text ?? opt?.optionText ?? SCALE_LABELS[oidx] ?? "",
            score: Number(
              opt?.score ??
                opt?.value ??
                SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - oidx] ??
                1
            ),
          }))
        : createScaleOptions();

    const cs = q?.csScores ?? q?.csScore ?? {};

    return {
      id: String(q?.id ?? q?.questionId ?? idx),
      title: q?.title ?? q?.questionTitle ?? q?.text ?? "",
      type: type === "SHORT" ? "SHORT" : "SCALE",
      scaleOptions,
      shortAnswer: q?.shortAnswer ?? q?.answer ?? "",
      csScores: {
        criticalThinking: Number(cs?.criticalThinking ?? cs?.ct ?? 5),
        character: Number(cs?.character ?? cs?.ch ?? 5),
        communication: Number(cs?.communication ?? cs?.com ?? 5),
        collaboration: Number(cs?.collaboration ?? cs?.col ?? 5),
        creativity: Number(cs?.creativity ?? cs?.cre ?? 5),
        convergence: Number(cs?.convergence ?? cs?.conv ?? 5),
      },
    };
  });
}

function unwrapDetail(raw: any) {
  if (!raw || typeof raw !== "object") return raw;
  const directKeys = [
    "startedAt",
    "endedAt",
    "startDate",
    "endDate",
    "period",
    "submitPeriod",
    "submissionPeriod",
  ];
  if (directKeys.some((key) => key in raw)) return raw;

  const candidate =
    raw?.data ??
    raw?.result ??
    raw?.diagnosis ??
    raw?.item ??
    raw?.detail ??
    raw?.payload ??
    raw?.response;

  if (candidate && typeof candidate === "object") {
    if ("data" in candidate && candidate.data && typeof candidate.data === "object") {
      return candidate.data;
    }
    return candidate;
  }

  return raw;
}

function mapDetailValue(raw: any): DiagnosisFormValue {
  const base = unwrapDetail(raw) ?? raw;
  const info = base?.basicInfo ?? base?.diagnosis ?? base?.detail ?? base;
  const questionsRaw = base?.questions ?? info?.questions;
  const deptId = info?.deptId ?? info?.departmentId ?? base?.deptId ?? base?.departmentId;
  const deptName =
    info?.deptName ?? info?.departmentName ?? base?.deptName ?? base?.departmentName;

  const deptValue =
    deptId !== undefined && deptId !== null
      ? String(deptId)
      : deptName === "All" || deptName === "전체"
        ? "All"
        : "";

  const directStart =
    pickFirstValue(info, [
      "startedAt",
      "startDate",
      "startAt",
      "startDatetime",
      "startDateTime",
      "submitStartAt",
      "submitStartDate",
      "submissionStartAt",
      "submissionStartDate",
      "periodStart",
      "period.start",
      "period.startDate",
      "period.startedAt",
      "period.startAt",
      "period.startDatetime",
      "period.startDateTime",
      "schedule.start",
      "schedule.startDate",
      "schedule.startedAt",
      "schedule.startAt",
      "schedule.beginAt",
      "diagnosis.startedAt",
      "diagnosis.startDate",
      "diagnosis.startAt",
      "diagnosisRun.startedAt",
      "diagnosisRun.startAt",
      "run.startedAt",
      "run.startAt",
    ]) ??
    pickFirstValue(base, [
    "startedAt",
    "startDate",
    "startAt",
    "startDatetime",
    "startDateTime",
    "submitStartAt",
    "submitStartDate",
    "submissionStartAt",
    "submissionStartDate",
    "periodStart",
    "period.start",
    "period.startDate",
    "period.startedAt",
    "period.startAt",
    "period.startDatetime",
    "period.startDateTime",
    "schedule.start",
    "schedule.startDate",
    "schedule.startedAt",
    "schedule.startAt",
    "schedule.beginAt",
    "diagnosis.startedAt",
    "diagnosis.startDate",
    "diagnosis.startAt",
    "diagnosisRun.startedAt",
    "diagnosisRun.startAt",
    "run.startedAt",
    "run.startAt",
    ]);

  const directEnd =
    pickFirstValue(info, [
      "endedAt",
      "endDate",
      "endAt",
      "endDatetime",
      "endDateTime",
      "submitEndAt",
      "submitEndDate",
      "submissionEndAt",
      "submissionEndDate",
      "periodEnd",
      "period.end",
      "period.endDate",
      "period.endedAt",
      "period.endAt",
      "period.endDatetime",
      "period.endDateTime",
      "schedule.end",
      "schedule.endDate",
      "schedule.endedAt",
      "schedule.endAt",
      "schedule.finishAt",
      "diagnosis.endedAt",
      "diagnosis.endDate",
      "diagnosis.endAt",
      "diagnosisRun.endedAt",
      "diagnosisRun.endAt",
      "run.endedAt",
      "run.endAt",
    ]) ??
    pickFirstValue(base, [
    "endedAt",
    "endDate",
    "endAt",
    "endDatetime",
    "endDateTime",
    "submitEndAt",
    "submitEndDate",
    "submissionEndAt",
    "submissionEndDate",
    "periodEnd",
    "period.end",
    "period.endDate",
    "period.endedAt",
    "period.endAt",
    "period.endDatetime",
    "period.endDateTime",
    "schedule.end",
    "schedule.endDate",
    "schedule.endedAt",
    "schedule.endAt",
    "schedule.finishAt",
    "diagnosis.endedAt",
    "diagnosis.endDate",
    "diagnosis.endAt",
    "diagnosisRun.endedAt",
    "diagnosisRun.endAt",
    "run.endedAt",
    "run.endAt",
    ]);

  const periodText =
    pickFirstValue(info, [
      "period",
      "submitPeriod",
      "submissionPeriod",
      "periodText",
      "submissionRange",
      "dateRange",
      "datePeriod",
      "diagnosisPeriod",
    ]) ??
    pickFirstValue(base, [
    "period",
    "submitPeriod",
    "submissionPeriod",
    "periodText",
    "submissionRange",
    "dateRange",
    "datePeriod",
    "diagnosisPeriod",
    ]);

  const parsed = parsePeriodText(typeof periodText === "string" ? periodText : undefined);
  const startedAt = toDateOnly(directStart) || parsed.start;
  const endedAt = toDateOnly(directEnd) || parsed.end;

  return {
    deptValue,
    gradeValue: toGradeValue(
      info?.targetGrade ??
        info?.grade ??
        info?.gradeLevel ??
        base?.targetGrade ??
        base?.grade ??
        base?.gradeLevel
    ),
    startedAt,
    endedAt,
    status: info?.status ?? base?.status ?? "DRAFT",
    questions: mapQuestions(questionsRaw),
  };
}

export default function DignosisEditPageClient({ dignosisId }: Props) {
  const router = useRouter();
  const [initialValue, setInitialValue] = useState<DiagnosisFormValue | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const encodedId = useMemo(() => encodeURIComponent(String(dignosisId)), [dignosisId]);

  useEffect(() => {
    let alive = true;
    setError(null);

    (async () => {
      try {
        const res = await getJson<DiagnosisDetailResponse>(`/api/admin/competencies/dignosis/${encodedId}`);
        const data = (res as any)?.data ?? res ?? {};
        if (!alive) return;
        setInitialValue(mapDetailValue(data));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "진단지 상세를 불러오지 못했습니다.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [encodedId]);

  const handleClose = useCallback(() => {
    router.push("/admin/competencies/dignosis");
  }, [router]);

  const handleSubmit = useCallback(
    async (payload: DiagnosisFormValue) => {
      if (saving) return;
      setSaving(true);
      setError(null);
      try {
        await patchJson(`/api/admin/competencies/dignosis/${encodedId}`, payload);
      } catch (e: any) {
        const message = e?.message ?? "진단지 수정에 실패했습니다.";
        setError(message);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [encodedId, saving]
  );

  useEffect(() => {
    if (!error) return;
    window.alert(error);
  }, [error]);

  return (
    <>
      <DignosisPageClient />
      <DignosisEditModal
        open
        onClose={handleClose}
        initialValue={initialValue}
        onSubmit={handleSubmit}
      />
    </>
  );
}
