"use client";

import { useMemo, useState } from "react";
import styles from "./ResultPage.module.css";
import { useResultList } from "@/features/competencies/result/hooks/useResultList";
import { recalculateCompetencySummary } from "@/features/competencies/result/api/ResultCompetenciesApi";
import type {
  ResultCompetencyDashboard,
  ResultCompetencyRadarItem,
  ResultCompetencyRadarSeries,
  ResultCompetencyStatRow,
} from "@/features/competencies/result/api/types";
import { Button } from "@/components/button";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useDeptsDropdownOptions } from "@/features/dropdowns/depts/hooks";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RADAR_COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#e11d48", "#0ea5e9", "#10b981"];
const LINE_COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#e11d48", "#0ea5e9"];

type NormalizedRadarSeries = {
  deptName: string;
  items: { name: string; value: number }[];
};

export default function ResultPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dignosisId = searchParams.get("dignosisId") ?? "1";
  const semesterIdParam = searchParams.get("semesterId");
  const semesterNameParam = searchParams.get("semesterName");
  const semesterId = semesterIdParam ?? (semesterNameParam ? "" : "1");
  const statusParam = searchParams.get("status");
  const { options: deptOptionsRaw, loading: deptLoading } = useDeptsDropdownOptions();
  const { options: semesterOptions } = useSemestersDropdownOptions();
  const [selectedDeptValue, setSelectedDeptValue] = useState("");
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);



  const resolvedSemesterId = useMemo(() => {
    if (semesterIdParam) return semesterIdParam;
    if (!semesterNameParam) return "";

    const normalize = (value: string) =>
      value
        .replace(/\s+/g, "")
        .replace(/학년도/g, "")
        .replace(/학기/g, "")
        .replace(/-/g, "")
        .toLowerCase();

    const target = normalize(semesterNameParam);
    const match = semesterOptions.find((opt) => normalize(opt.label) === target);
    return match?.value ?? "";
  }, [semesterIdParam, semesterNameParam, semesterOptions]);

  const isClosed = String(statusParam ?? "").toUpperCase() === "CLOSED";



  const selectedDeptLabel = useMemo(() => {
    if (!selectedDeptValue) return "";
    return deptOptionsRaw.find((o) => o.value === selectedDeptValue)?.label ?? selectedDeptValue;
  }, [deptOptionsRaw, selectedDeptValue]);

  const query = useMemo(() => {
    if (!dignosisId) return undefined;
    const semesterQuery = semesterId
      ? { semesterId }
      : semesterNameParam
        ? { semesterName: semesterNameParam }
        : {};
    const isDeptId = deptOptionsRaw.some((o) => o.value === selectedDeptValue);
    if (!selectedDeptValue) return { dignosisId, ...semesterQuery };
    return isDeptId
      ? { dignosisId, deptId: selectedDeptValue, deptName: selectedDeptLabel, ...semesterQuery }
      : { dignosisId, deptName: selectedDeptLabel, ...semesterQuery };
  }, [deptOptionsRaw, dignosisId, selectedDeptLabel, selectedDeptValue, semesterId, semesterNameParam]);

  const { state, actions } = useResultList(query);

  const handleRecalculate = async () => {
    if (!isClosed || recalcLoading) return;
    const semesterIdValue = resolvedSemesterId || "";
    if (!semesterIdValue) {
      setRecalcError("학기 정보를 찾을 수 없습니다.");
      return;
    }
    setRecalcLoading(true);
    setRecalcError(null);
    try {
      await recalculateCompetencySummary(semesterIdValue);
      await actions.reload();
    } catch (e: any) {
      setRecalcError(e?.message ?? "역량 재계산에 실패했습니다.");
    } finally {
      setRecalcLoading(false);
    }
  };

  const summary = useMemo(() => normalizeSummary(state.data), [state.data]);
  const radarSeries = useMemo(() => normalizeRadarSeries(state.data), [state.data]);

  const derivedDeptNames = useMemo(() => {
    const set = new Set<string>();
    const data = state.data;
    const rawDepts = [
      ...(Array.isArray(data?.deptNames) ? data?.deptNames : []),
      ...(Array.isArray(data?.departments) ? data?.departments : []),
    ];
    rawDepts.forEach((d) => {
      if (typeof d === "string" && d.trim()) set.add(d);
    });
    radarSeries.forEach((s) => {
      if (s.deptName) set.add(s.deptName);
    });
    return Array.from(set.values()).sort();
  }, [state.data, radarSeries]);

  const deptOptions = useMemo(() => {
    return deptOptionsRaw.length > 0
      ? deptOptionsRaw
      : derivedDeptNames.map((d) => ({ value: d, label: d }));
  }, [deptOptionsRaw, derivedDeptNames]);

  const filteredRadarSeries = useMemo(() => {
    if (!selectedDeptLabel) return radarSeries;
    return radarSeries.filter((s) => s.deptName === selectedDeptLabel);
  }, [radarSeries, selectedDeptLabel]);

  const radarData = useMemo(() => buildRadarData(filteredRadarSeries), [filteredRadarSeries]);

  const trendSeries = useMemo(() => normalizeTrendSeries(state.data), [state.data]);
  const trendData = useMemo(() => normalizeTrendData(state.data, trendSeries), [state.data, trendSeries]);

  const statsRows = useMemo(() => normalizeStats(state.data), [state.data]);

  if (state.loading || recalcLoading) {
    return <div className={styles.page}>불러오는 중...</div>;
  }

  if (state.error || recalcError) {
    return <div className={styles.page}>{state.error ?? recalcError}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>역량 통합 관리</h1>
          {isClosed && (
            <Button
              variant="primary"
              onClick={handleRecalculate}
              disabled={recalcLoading || !resolvedSemesterId}
            >
              결과 산출
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push("/admin/competencies/dignosis")}>
            목록
          </Button>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>대상자수</div>
            <div className={styles.summaryValue}>{formatNumber(summary.totalCount)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>산출대상자수</div>
            <div className={styles.summaryValue}>{formatNumber(summary.calculatedCount)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>평균</div>
            <div className={styles.summaryValue}>{formatScore(summary.averageScore)}</div>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>역량 차트</h2>
              <div className={styles.dropdownWrap}>
                <Dropdown
                  value={selectedDeptValue}
                  options={deptOptions}
                  placeholder="전체"
                  loading={deptLoading}
                  onChange={setSelectedDeptValue}
                />
              </div>
            </div>
            <div className={styles.chartWrap}>
              {radarData.length === 0 ? (
                <div className={styles.empty}>차트 데이터가 없습니다.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="78%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Tooltip formatter={(v) => formatScore(v)} />
                    <Legend />
                    {filteredRadarSeries.map((series, index) => (
                      <Radar
                        key={series.deptName}
                        dataKey={series.deptName}
                        stroke={RADAR_COLORS[index % RADAR_COLORS.length]}
                        fill={RADAR_COLORS[index % RADAR_COLORS.length]}
                        fillOpacity={selectedDeptLabel ? 0.25 : 0.18}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>상대 차트</h2>
            </div>
            <div className={styles.chartWrap}>
              {trendData.length === 0 || trendSeries.length === 0 ? (
                <div className={styles.empty}>차트 데이터가 없습니다.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke="#eef2f6" strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#475467" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#475467" }} />
                    <Tooltip />
                    <Legend />
                    {trendSeries.map((s, i) => (
                      <Line
                        key={s.name}
                        type="monotone"
                        dataKey={s.name}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>

        <section className={styles.tableSection}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>역량 통계</h2>
          </div>
          <div className={styles.tableWrap}>
            {statsRows.length === 0 ? (
              <div className={styles.empty}>통계 데이터가 없습니다.</div>
            ) : (
              <table className={styles.statTable}>
                <thead>
                  <tr>
                    <th>역량 이름</th>
                    <th>대상자수/산출대상자수</th>
                    <th>평균</th>
                    <th>중간값</th>
                    <th>표준편차</th>
                    <th>산출일시</th>
                  </tr>
                </thead>
                <tbody>
                  {statsRows.map((row) => (
                    <tr key={row.key}>
                      <td>{row.name}</td>
                      <td>
                        {formatNumber(row.totalTargets)} / {formatNumber(row.calculatedTargets)}
                      </td>
                      <td>{formatScore(row.avgScore)}</td>
                      <td>{formatScore(row.medianScore)}</td>
                      <td>{formatScore(row.stdDev)}</td>
                      <td>{formatDateTime(row.calculatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function normalizeSummary(data: ResultCompetencyDashboard | null) {
  if (!data) {
    return { totalCount: null, calculatedCount: null, averageScore: null };
  }

  const summary =
    data.summary ??
    data.overview ??
    (data as any).statistics ??
    (data as any).stats ??
    (data as any);

  return {
    totalCount: pickNumber(summary, [
      "targetCount",
      "totalCount",
      "totalTargets",
      "totalStudents",
      "population",
      "total",
      "count",
    ]),
    calculatedCount: pickNumber(summary, [
      "responseCount",
      "calculatedCount",
      "calculatedTargets",
      "evaluatedCount",
      "computedCount",
      "resultCount",
      "completedCount",
      "calculated",
    ]),
    averageScore: pickNumber(summary, ["totalAverage", "averageScore", "avgScore", "meanScore", "avg"]),
  };
}

function normalizeRadarSeries(data: ResultCompetencyDashboard | null): NormalizedRadarSeries[] {
  if (!data) return [];
  const raw =
    (data as any).radarChart ??
    (data as any).radarCharts ??
    (data as any).radarSeries ??
    (data as any).deptRadarCharts ??
    [];

  if (!Array.isArray(raw) || raw.length === 0) return [];

  if (raw.every((item) => isRadarItem(item))) {
    return [
      {
        deptName: "전체",
        items: normalizeRadarItems(raw),
      },
    ];
  }

  return raw
    .map((series: ResultCompetencyRadarSeries, idx: number) => {
      const name =
        pickString(series, ["deptName", "department", "dept", "name", "label"]) || `학과 ${idx + 1}`;
      const itemsRaw =
        (series as any).items ??
        (series as any).data ??
        (series as any).values ??
        (series as any).radarChart ??
        (series as any).radar ??
        (series as any).list ??
        [];
      return {
        deptName: name,
        items: normalizeRadarItems(itemsRaw),
      };
    })
    .filter((s) => s.items.length > 0);
}

function normalizeRadarItems(items: ResultCompetencyRadarItem[] | any) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    name: pickString(item, ["name", "label", "competencyName"]) || `역량 ${index + 1}`,
    value: pickNumber(item, ["value", "score", "avgScore", "weight", "myScore", "maxScore"]) ?? 0,
  }));
}

function isRadarItem(item: any) {
  if (!item || typeof item !== "object") return false;
  return (
    "name" in item ||
    "label" in item ||
    "competencyName" in item ||
    "value" in item ||
    "score" in item ||
    "avgScore" in item ||
    "weight" in item
  );
}

function buildRadarData(series: NormalizedRadarSeries[]) {
  const rows: Record<string, any>[] = [];
  const indexMap = new Map<string, Record<string, any>>();
  series.forEach((s) => {
    s.items.forEach((item) => {
      const key = item.name;
      let row = indexMap.get(key);
      if (!row) {
        row = { name: key };
        indexMap.set(key, row);
        rows.push(row);
      }
      row[s.deptName] = item.value ?? 0;
    });
  });
  return rows;
}

function normalizeTrendSeries(data: ResultCompetencyDashboard | null) {
  if (!data) return [];
  const raw = (data as any).trendChart ?? (data as any).trend ?? (data as any).trendData ?? null;
  const seriesRaw = raw?.series ?? raw?.lines ?? raw?.data ?? [];
  if (!Array.isArray(seriesRaw)) return [];
  return seriesRaw.map((s: any, idx: number) => ({
    name: pickString(s, ["name", "label"]) || `Series ${idx + 1}`,
    data: Array.isArray(s?.data) ? s.data.map((v: any) => pickNumber({ value: v }, ["value"]) ?? 0) : [],
  }));
}

function normalizeTrendData(data: ResultCompetencyDashboard | null, series: { name: string; data: number[] }[]) {
  if (!data || series.length === 0) return [];
  const raw = (data as any).trendChart ?? (data as any).trend ?? (data as any).trendData ?? null;
  const categories = Array.isArray(raw?.categories)
    ? raw.categories
    : Array.isArray(raw?.labels)
      ? raw.labels
      : [];
  const maxLen = Math.max(...series.map((s) => s.data.length), 0);
  const normalizedCategories =
    categories.length > 0
      ? categories
      : Array.from({ length: maxLen }, (_, i) => `${i + 1}`);

  return normalizedCategories.map((cat: any, idx: number) => {
    const row: Record<string, any> = { category: String(cat ?? idx + 1) };
    series.forEach((s) => {
      row[s.name] = s.data[idx] ?? null;
    });
    return row;
  });
}

function normalizeStats(data: ResultCompetencyDashboard | null) {
  const raw =
    (data as any)?.statsTable ??
    (data as any)?.table ??
    (data as any)?.rows ??
    (data as any)?.items ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw.map((row: ResultCompetencyStatRow, idx: number) => ({
    key: `${pickString(row, ["name", "competencyName"]) || "row"}-${idx}`,
    name: pickString(row, ["name", "competencyName"]) || `역량 ${idx + 1}`,
    totalTargets: pickNumber(row, ["targetCount", "totalTargets", "totalCount", "targets", "total"]),
    calculatedTargets: pickNumber(row, [
      "responseCount",
      "calculatedTargets",
      "calculatedCount",
      "computedTargets",
      "completed",
    ]),
    avgScore: pickNumber(row, ["mean", "avgScore", "averageScore", "avg"]),
    medianScore: pickNumber(row, ["medianScore", "median", "midScore"]),
    stdDev: pickNumber(row, ["stdDev", "std", "standardDeviation", "deviation"]),
    calculatedAt: pickString(row, ["calculatedAt", "calculatedDate", "updatedAt", "date"]),
  }));
}

function pickString(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function pickNumber(obj: any, keys: string[]) {
  for (const k of keys) {
    const raw = obj?.[k];
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function formatScore(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(2);
}

function formatNumber(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return String(Math.floor(n));
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} - ${hh}:${min}`;
}
























