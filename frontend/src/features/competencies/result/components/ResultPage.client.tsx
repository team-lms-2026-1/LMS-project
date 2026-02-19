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

const RADAR_COLOR_CLASSES = [
  styles.legendColorBlue,
  styles.legendColorGreen,
  styles.legendColorOrange,
  styles.legendColorPurple,
  styles.legendColorRed,
  styles.legendColorSky,
  styles.legendColorTeal,
];
const LINE_COLOR_CLASSES = [
  styles.legendColorBlue,
  styles.legendColorGreen,
  styles.legendColorOrange,
  styles.legendColorPurple,
  styles.legendColorRed,
  styles.legendColorSky,
  styles.legendColorTeal,
];
const RADAR_COLOR_VARS = [
  "var(--series-blue)",
  "var(--series-green)",
  "var(--series-orange)",
  "var(--series-purple)",
  "var(--series-red)",
  "var(--series-sky)",
  "var(--series-teal)",
];
const LINE_COLOR_VARS = [
  "var(--series-blue)",
  "var(--series-green)",
  "var(--series-orange)",
  "var(--series-purple)",
  "var(--series-red)",
  "var(--series-sky)",
  "var(--series-teal)",
];
const RADAR_CHART_MARGIN = { top: 8, right: 8, bottom: 24, left: 8 };
const LINE_CHART_MARGIN = { top: 20, right: 20, left: 0, bottom: 10 };
const RADAR_OUTER_RADIUS = "78%";

type NormalizedRadarSeries = {
  deptName: string;
  items: { name: string; value: number }[];
};

export default function ResultPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const semesterIdParam = searchParams.get("semesterId")?.trim() ?? "";
  const semesterNameParam = searchParams.get("semesterName")?.trim() ?? "";
  const statusParam = searchParams.get("status");
  const { options: deptOptionsRaw, loading: deptLoading } = useDeptsDropdownOptions();
  const { options: semesterOptions } = useSemestersDropdownOptions();
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);
  const [trendDeptValue, setTrendDeptValue] = useState("");



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



  const query = useMemo(() => {
    const semesterQuery = semesterIdParam
      ? { semesterId: semesterIdParam }
      : semesterNameParam
        ? { semesterName: semesterNameParam }
        : {};
    return semesterQuery;
  }, [semesterIdParam, semesterNameParam]);

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
  const trendDeptOptions = useMemo(() => {
    const names = new Set<string>();
    deptOptionsRaw.forEach((opt) => {
      const label = String(opt.label ?? "").trim();
      if (label && label !== "전체") names.add(label);
    });
    const data = state.data;
    const rawDepts = [
      ...(Array.isArray(data?.deptNames) ? data?.deptNames : []),
      ...(Array.isArray(data?.departments) ? data?.departments : []),
    ];
    rawDepts.forEach((d) => {
      if (typeof d === "string" && d.trim()) names.add(d.trim());
    });
    radarSeries.forEach((s) => {
      if (s.deptName) names.add(String(s.deptName).trim());
    });
    return Array.from(names)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((dept) => ({ value: dept, label: dept }));
  }, [deptOptionsRaw, state.data, radarSeries]);
  const isTrendDeptSelected = Boolean(trendDeptValue.trim());
  const radarData = useMemo(() => buildRadarData(radarSeries), [radarSeries]);
  const isSingleRadarSeries = radarSeries.length <= 1;

  const trendSeries = useMemo(() => normalizeTrendSeries(state.data), [state.data]);
  const filteredTrendSeries = useMemo(() => {
    if (!isTrendDeptSelected) return [];
    const prefix = `${trendDeptValue} -`;
    const matched = trendSeries.filter(
      (s) => s.name === trendDeptValue || s.name.startsWith(prefix)
    );
    return matched;
  }, [trendSeries, isTrendDeptSelected, trendDeptValue]);
  const trendData = useMemo(
    () => normalizeTrendData(state.data, filteredTrendSeries),
    [state.data, filteredTrendSeries]
  );


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
          <div className={styles.topActions}>
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
            </div>
            <div className={styles.chartWrap}>
              {radarData.length === 0 ? (
                <div className={styles.empty}>차트 데이터가 없습니다.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius={RADAR_OUTER_RADIUS} margin={RADAR_CHART_MARGIN}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={{ className: styles.radarTick }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Tooltip formatter={(v) => formatScore(v)} />
                    <Legend
                      verticalAlign="bottom"
                      height={12}
                      content={renderRadarLegend}
                    />
                    {radarSeries.map((series, index) => (
                      <Radar
                        key={series.deptName}
                        dataKey={series.deptName}
                        stroke={RADAR_COLOR_VARS[index % RADAR_COLOR_VARS.length]}
                        fill={RADAR_COLOR_VARS[index % RADAR_COLOR_VARS.length]}
                        className={`${styles.radarSeries} ${RADAR_COLOR_CLASSES[index % RADAR_COLOR_CLASSES.length]} ${
                          isSingleRadarSeries ? styles.radarFillSingle : styles.radarFillAll
                        }`}
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
              <div className={styles.filterWrap}>
                <span className={styles.filterLabel}>학과</span>
                <Dropdown
                  value={trendDeptValue}
                  onChange={setTrendDeptValue}
                  options={trendDeptOptions}
                  placeholder="학과 선택"
                  loading={deptLoading}
                  className={styles.dropdownWrap}
                />
              </div>

            </div>
            <div className={styles.chartWrap}>
              {!isTrendDeptSelected ? (
                <div className={styles.emptyCentered}>학과를 선택해주세요</div>
              ) : trendData.length === 0 || filteredTrendSeries.length === 0 ? (
                <div className={styles.empty}>차트 데이터가 없습니다.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={LINE_CHART_MARGIN}>
                    <CartesianGrid className={styles.chartGrid} />
                    <XAxis dataKey="category" tick={{ className: styles.axisTick }} />
                    <YAxis tick={{ className: styles.axisTick }} />
                    <Tooltip formatter={(value) => formatScore(value)} />
                    <Legend verticalAlign="bottom" align="center" content={renderLineLegend} />
                    {filteredTrendSeries.map((s, i) => (
                      <Line
                        key={s.name}
                        type="monotone"
                        dataKey={s.name}
                        stroke={LINE_COLOR_VARS[i % LINE_COLOR_VARS.length]}
                        className={`${styles.chartLine} ${LINE_COLOR_CLASSES[i % LINE_COLOR_CLASSES.length]}`}
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
function renderCircleLegend(
  props: any,
  options: {
    columns?: number;
    showDash?: boolean;
    variant?: "radar" | "line";
    colorClasses?: string[];
  } = {}
) {
  const payload = props?.payload ?? [];
  if (!payload.length) return null;
  const maxColumns = options.columns ?? payload.length;
  const columnCount = Math.max(1, Math.min(maxColumns, payload.length));
  const showDash = options.showDash ?? false;
  const colorClasses = options.colorClasses ?? [];
  const variantClass = options.variant === "radar" ? styles.legendWrapRadar : styles.legendWrapLine;
  const columnClass = styles[`legendCols${columnCount}`] ?? styles.legendCols3 ?? "";
  return (
    <div className={`${styles.legendWrap} ${variantClass}`}>
      <div className={`${styles.legendGrid} ${columnClass}`}>
        {payload.map((entry: any, index: number) => {
          const color = entry?.color ?? entry?.payload?.stroke ?? "#111827";
          const label = entry?.value ?? entry?.payload?.name ?? "";
          const colorKey = typeof color === "string" ? color.toLowerCase() : "";
          const indexedClass = colorClasses.length
            ? colorClasses[index % colorClasses.length]
            : undefined;
          const colorClass =
            indexedClass ?? LEGEND_COLOR_CLASS[colorKey] ?? styles.legendColorDefault;
          return (
            <div key={`${label || "legend"}-${index}`} className={`${styles.legendItem} ${colorClass}`}>
              <span className={styles.legendIcon}>
                {showDash ? <span className={styles.legendDash}>-</span> : null}
                <span className={styles.legendDot} />
              </span>
              <span className={styles.legendLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderLineLegend(props: any) {
  return renderCircleLegend(props, {
    columns: 3,
    showDash: true,
    variant: "line",
    colorClasses: LINE_COLOR_CLASSES,
  });
}

function renderRadarLegend(props: any) {
  return renderCircleLegend(props, {
    columns: 2,
    variant: "radar",
    colorClasses: RADAR_COLOR_CLASSES,
  });
}

const LEGEND_COLOR_CLASS: Record<string, string> = {
  "#2563eb": styles.legendColorBlue,
  "#16a34a": styles.legendColorGreen,
  "#f97316": styles.legendColorOrange,
  "#7c3aed": styles.legendColorPurple,
  "#e11d48": styles.legendColorRed,
  "#0ea5e9": styles.legendColorSky,
  "#10b981": styles.legendColorTeal,
  "#facc15": styles.legendColorYellow,
};


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
























