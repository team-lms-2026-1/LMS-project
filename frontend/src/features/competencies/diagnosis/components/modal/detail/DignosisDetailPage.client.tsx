"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getJson } from "@/lib/http";
import DignosisPageClient from "@/features/competencies/diagnosis/components/list/DignosisPage.client";
import { DignosisDetailModal } from "./DignosisDetailModal.client";
import type {
  DiagnosisDetailValue,
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

// ✅ 추가: string만 뽑아오는 버전
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
            score: Number(opt?.score ?? opt?.value ?? SCORE_OPTIONS[SCORE_OPTIONS.length - 1 - oidx] ?? 1),
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

// ✅ 여기부터 완전히 정리 (중복/미정의/스코프 오류 제거)
function mapDetailValue(raw: any): DiagnosisDetailValue {
  const base = unwrapDetail(raw) ?? raw;
  const info = base?.basicInfo ?? base?.diagnosis ?? base?.detail ?? base;

  const questionsRaw = base?.questions ?? info?.questions;

  const deptId = info?.deptId ?? info?.departmentId ?? base?.deptId ?? base?.departmentId;
  const deptName = info?.deptName ?? info?.departmentName ?? base?.deptName ?? base?.departmentName;

  const deptValue =
    deptId !== undefined && deptId !== null
      ? String(deptId)
      : deptName === "All" || deptName === "전체"
        ? "All"
        : "";

  // 1) “직접 필드”로 시작/종료일 찾기
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

  return {
    deptValue,
    gradeValue: toGradeValue(
      info?.targetGrade ?? info?.grade ?? info?.gradeLevel ?? base?.targetGrade ?? base?.grade ?? base?.gradeLevel
    ),
    startedAt,
    endedAt,
    status: info?.status ?? base?.status ?? "DRAFT",
    questions: mapQuestions(questionsRaw),
  };
}

export default function DignosisDetailPageClient({ dignosisId }: Props) {
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

  useEffect(() => {
    let alive = true;
    setError(null);

    (async () => {
      try {
        const res = await getJson<DiagnosisDetailResponse>(`/api/admin/competencies/dignosis/${encodedId}`);
        const raw = (res as any)?.data ?? res ?? {};
        if (!alive) return;

        const mapped = mapDetailValue(raw);

        // 혹시 백엔드가 여기로만 주는 경우 대비
        const rawInfo = (raw as any)?.basicInfo ?? (raw as any)?.diagnosis ?? (raw as any)?.detail ?? raw;
        const rawStartedAt = toDateOnly(rawInfo?.startedAt ?? rawInfo?.startDate ?? rawInfo?.startAt);
        const rawEndedAt = toDateOnly(rawInfo?.endedAt ?? rawInfo?.endDate ?? rawInfo?.endAt);

        setValue({
          ...mapped,
          startedAt: mapped.startedAt || rawStartedAt || fallbackStartedAt,
          endedAt: mapped.endedAt || rawEndedAt || fallbackEndedAt,
        });
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "진단지 상세를 불러오지 못했습니다.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [encodedId, fallbackEndedAt, fallbackStartedAt]);

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
      <DignosisDetailModal open onClose={handleClose} onEdit={handleEdit} value={value} />
    </>
  );
}
