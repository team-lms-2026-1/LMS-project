"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DignosisPageClient from "@/features/competencies/diagnosis/components/list/DignosisPage.client";
import { DignosisEditModal } from "./DignosisEditModal.client";
import {
  fetchDiagnosisDetail,
  updateDiagnosis,
} from "@/features/competencies/diagnosis/api/DiagnosisApi";
import type {
  DiagnosisDetailValue,
  DiagnosisUpsertPayload,
  DiagnosisQuestion,
  DiagnosisQuestionType,
  DiagnosisEditPageProps,
} from "@/features/competencies/diagnosis/api/types";


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

function toTimeOnly(value?: string | number | Date | null) {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString().slice(11, 16);
  const text = String(value).trim();
  if (!text) return "";
  if (text.includes("T")) {
    const time = text.split("T")[1]?.slice(0, 5) ?? "";
    return /^\d{2}:\d{2}$/.test(time) ? time : "";
  }
  return "";
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
            score: Number(
              opt?.score ??
                opt?.value ??
                SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - oidx] ??
                1
            ),
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

function mapDetailValue(raw: any): DiagnosisDetailValue {
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

  const directStart = pickFirstValue(info, ["startedAt"]) ?? pickFirstValue(base, ["startedAt"]);

  const directEnd = pickFirstValue(info, ["endedAt"]) ?? pickFirstValue(base, ["endedAt"]);

  const startedAt = toDateOnly(directStart);
  const endedAt = toDateOnly(directEnd);
  const startedTime = toTimeOnly(directStart);
  const endedTime = toTimeOnly(directEnd);

  const title =
    (pickFirstValue(info, ["title", "diagnosisTitle", "name"]) ??
      pickFirstValue(base, ["title", "diagnosisTitle", "name"])) ??
    "";

  const semesterId = pickFirstValue(info, ["semesterId", "semester.semesterId", "semester.id"]) ??
    pickFirstValue(base, ["semesterId", "semester.semesterId", "semester.id"]);

  return {
    title: String(title ?? ""),
    semesterId: semesterId !== undefined && semesterId !== null ? Number(semesterId) : undefined,
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
    startedTime,
    endedTime,
    status: info?.status ?? base?.status ?? "DRAFT",
    questions: mapQuestions(questionsRaw),
  };
}

export default function DignosisEditPageClient({ dignosisId }: DiagnosisEditPageProps) {
  const router = useRouter();
  const [initialValue, setInitialValue] = useState<DiagnosisDetailValue | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setError(null);

    (async () => {
      try {
        const res = await fetchDiagnosisDetail(dignosisId);
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
  }, [dignosisId]);

  const handleClose = useCallback(() => {
    router.push("/admin/competencies/dignosis");
  }, [router]);

  const handleSubmit = useCallback(
    async (payload: DiagnosisUpsertPayload) => {
      if (saving) return;
      setSaving(true);
      setError(null);
      try {
        await updateDiagnosis(dignosisId, payload);
        toast.success("진단지가 수정되었습니다.", { style: { zIndex: 9999 } });
      } catch (e: any) {
        const message = e?.message ?? "진단지 수정에 실패했습니다.";
        setError(message);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [dignosisId, saving]
  );

  useEffect(() => {
    if (!error) return;
    toast.error(error, { style: { zIndex: 9999 } });
  }, [error]);

  return (
    <>
      <DignosisPageClient />
      <DignosisEditModal
        open
        onClose={handleClose}
        initialValue={initialValue}
        onSubmit={handleSubmit}
        dignosisId={dignosisId}
      />
    </>
  );
}
