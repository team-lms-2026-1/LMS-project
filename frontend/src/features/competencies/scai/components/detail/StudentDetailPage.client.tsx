"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./StudentDetailPage.module.css";
import { fetchStudentCompetencyDashboard } from "../../api/StudentCompetencyApi";
import type {
  StudentCompetencyDashboard,
  StudentCompetencyRadarItem,
  StudentCompetencyStatRow,
  StudentCompetencyTrendSeries,
} from "../../api/types";
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

const LINE_COLOR_CLASSES = [
  styles.legendColorBlue,
  styles.legendColorGreen,
  styles.legendColorOrange,
  styles.legendColorPurple,
  styles.legendColorRed,
  styles.legendColorSky,
  styles.legendColorTeal,
];
const RADAR_COLOR_CLASSES = [styles.legendColorBlue, styles.legendColorOrange];
const LINE_COLOR_VARS = [
  "var(--series-blue)",
  "var(--series-green)",
  "var(--series-orange)",
  "var(--series-purple)",
  "var(--series-red)",
  "var(--series-sky)",
  "var(--series-teal)",
];
const RADAR_COLOR_VARS = ["var(--series-blue)", "var(--series-orange)"];
const RADAR_CHART_MARGIN = { top: 8, right: 8, bottom: 24, left: 8 };
const LINE_CHART_MARGIN = { top: 20, right: 20, left: 0, bottom: 10 };
const RADAR_OUTER_RADIUS = "78%";
const RADAR_LEGEND = {
  myScore: "\uB0B4 \uC810\uC218",
  deptAverage: "\uD559\uACFC \uD3C9\uADE0",
};

export default function StudentDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ studentId: string }>();
  const studentId = Number(params.studentId);

  const [data, setData] = useState<StudentCompetencyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(studentId)) {
      setError("유효하지 않은 학생 ID입니다.");
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStudentCompetencyDashboard(studentId);
        if (!alive) return;
        setData(res.data ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "학생 상세 정보를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [studentId]);

  const profile = data?.profile;
  const summary = data?.summary;

  const radarFallbackData = useMemo(() => normalizeRadar(data?.radarChart ?? []), [data?.radarChart]);
  const trendSeries = data?.trendChart?.series ?? [];
  const trendData = useMemo(
    () => normalizeTrend(data?.trendChart?.categories ?? [], trendSeries),
    [data?.trendChart?.categories, trendSeries]
  );
  const trendYAxis = useMemo(() => {
    if (!trendSeries.length) return undefined;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    trendSeries.forEach((series) => {
      (series.data ?? []).forEach((value) => {
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
  }, [trendSeries]);

  const myStatsRows = useMemo(
    () => normalizeMyStats(data?.myStatsTable ?? []),
    [data?.myStatsTable]
  );
  const comparisonRows = useMemo(
    () => normalizeMyStats(data?.comparisonTable ?? data?.myStatsTable ?? []),
    [data?.comparisonTable, data?.myStatsTable]
  );
  const radarComparisonData = useMemo(
    () =>
      myStatsRows.map((row) => ({
        name: row.name,
        myScore: row.myScore ?? 0,
        avgScore: row.avgScore ?? 0,
      })),
    [myStatsRows]
  );
  const computedMaxScore = useMemo(() => {
    const values = myStatsRows
      .map((row) => row.myMaxScore ?? row.myScore)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (values.length === 0) {
      const fallback = Number(summary?.maxScore);
      return Number.isFinite(fallback) ? fallback : null;
    }
    return Math.max(...values);
  }, [myStatsRows, summary?.maxScore]);
  const hasRadarComparison = radarComparisonData.length > 0;
  const radarData = hasRadarComparison ? radarComparisonData : radarFallbackData;
  if (loading) {
    return <div className={styles.page}>불러오는 중...</div>;
  }
  if (error) {
    return <div className={styles.page}>{error}</div>;
  }
  if (!data) {
    return <div className={styles.page}>데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>학생 역량 활동 조회</h1>
          <button type="button" className={styles.backBtn} onClick={() => router.back()}>
            목록
          </button>
        </div>

        <div className={styles.headerRow}>
          <div className={styles.sectionCard}>
            <div className={styles.profileName}>{profile?.name ?? "-"}</div>
            <div className={styles.profileMeta}>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>학번</span>
                <span className={styles.profileValue}>{profile?.studentNumber ?? "-"}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>학과</span>
                <span className={styles.profileValue}>{profile?.deptName ?? "-"}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>학년</span>
                <span className={styles.profileValue}>{formatNumber(profile?.grade)}</span>
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryBox}>
                <div className={styles.summaryLabel}>내 최고 점수</div>
                <div className={styles.summaryValue}>{formatScore(computedMaxScore)}</div>
              </div>
              <div className={styles.summaryBox}>
                <div className={styles.summaryLabel}>최근 역량 평균</div>
                <div className={styles.summaryValue}>{formatScore(summary?.recentAvg)}</div>
              </div>
              <div className={styles.summaryBox}>
                <div className={styles.summaryLabel}>최근 평가일시</div>
                <div className={styles.summaryValue}>{formatDateTime(summary?.lastEvaluationDate)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>내 역량</h2>
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
                    {hasRadarComparison ? (
                      <>
                        <Radar
                          name={RADAR_LEGEND.myScore}
                          dataKey="myScore"
                          stroke={RADAR_COLOR_VARS[0]}
                          fill={RADAR_COLOR_VARS[0]}
                          className={`${styles.radarSeries} ${RADAR_COLOR_CLASSES[0]} ${styles.radarFillStrong}`}
                        />
                        <Radar
                          name={RADAR_LEGEND.deptAverage}
                          dataKey="avgScore"
                          stroke={RADAR_COLOR_VARS[1]}
                          fill={RADAR_COLOR_VARS[1]}
                          className={`${styles.radarSeries} ${RADAR_COLOR_CLASSES[1]} ${styles.radarFillSoft}`}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={12}
                          content={renderRadarLegend}
                        />
                      </>
                    ) : (
                      <Radar
                        name={RADAR_LEGEND.myScore}
                        dataKey="value"
                        stroke={RADAR_COLOR_VARS[0]}
                        fill={RADAR_COLOR_VARS[0]}
                        className={`${styles.radarSeries} ${RADAR_COLOR_CLASSES[0]} ${styles.radarFillStrong}`}
                      />
                    )}
                    <Tooltip formatter={(v: number | string | undefined) => formatScore(v)} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>역량 추이</h2>
            </div>
            <div className={styles.chartWrap}>
              {trendData.length === 0 || trendSeries.length === 0 ? (
                <div className={styles.empty}>차트 데이터가 없습니다.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={LINE_CHART_MARGIN}>
                    <CartesianGrid className={styles.chartGrid} />
                    <XAxis dataKey="category" tick={{ className: styles.axisTick }} />
                    <YAxis
                      tick={{ className: styles.axisTick }}
                      domain={trendYAxis?.domain ?? ["auto", "auto"]}
                      ticks={trendYAxis?.ticks}
                      tickFormatter={(value: number) => String(Math.round(value))}
                      allowDecimals={false}
                    />
                    <Tooltip formatter={(value: number | string | undefined) => formatScore(value)} />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      content={renderLineLegend}
                    />
                    {trendSeries.map((s, i) => (
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>내 역량 통계</h2>
            </div>
            <div className={styles.tableWrap}>
              {myStatsRows.length === 0 ? (
                <div className={styles.empty}>데이터가 없습니다.</div>
              ) : (
                <table className={styles.statTable}>
                  <thead>
                    <tr>
                      <th>역량 이름</th>
                      <th>내 점수</th>
                      <th>평균</th>
                      <th>내 최고점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStatsRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.name}</td>
                        <td>{formatScore(row.myScore)}</td>
                        <td>{formatScore(row.myAvgScore)}</td>
                        <td>{formatScore(row.myMaxScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>내 역량 비교</h2>
            </div>
            <div className={styles.tableWrap}>
              {comparisonRows.length === 0 ? (
                <div className={styles.empty}>데이터가 없습니다.</div>
              ) : (
                <table className={styles.statTable}>
                  <thead>
                    <tr>
                      <th>역량 이름</th>
                      <th>내 점수</th>
                      <th>학과 평균</th>
                      <th>학과 최고점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.name}</td>
                        <td>{formatScore(row.myScore)}</td>
                        <td>{formatScore(row.avgScore)}</td>
                        <td>{formatScore(row.maxScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function normalizeRadar(items: StudentCompetencyRadarItem[]) {
  return items.map((item, index) => ({
    name: pickString(item, ["name", "label", "competencyName"]) || `역량 ${index + 1}`,
    value: pickNumber(item, ["value", "score", "myScore", "avgScore", "maxScore", "weight"]) ?? 0,
  }));
}

function normalizeTrend(categories: string[], series: StudentCompetencyTrendSeries[]) {
  if (!categories.length || !series.length) return [];
  return categories.map((cat, idx) => {
    const row: Record<string, any> = { category: cat };
    series.forEach((s) => {
      row[s.name] = pickNumber({ value: s.data?.[idx] }, ["value"]);
    });
    return row;
  });
}

function normalizeMyStats(rows: StudentCompetencyStatRow[]) {
  return rows.map((row, idx) => ({
    key: `${pickString(row, ["name", "competencyName"]) || "row"}-${idx}`,
    name: pickString(row, ["name", "competencyName"]) || `역량 ${idx + 1}`,
    myScore: pickNumber(row, ["myScore", "score", "value"]),
    myAvgScore: pickNumber(row, ["myAvgScore", "myAverage"]),
    myMaxScore: pickNumber(row, ["myMaxScore", "myMaximum"]),
    avgScore: pickNumber(row, ["avgScore", "average", "avg", "deptAvgScore", "deptAverage"]),
    maxScore: pickNumber(row, ["maxScore", "maximum", "max", "deptMaxScore", "deptMaximum"]),
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
  const variantClass =
    options.variant === "radar" ? styles.legendWrapRadar : styles.legendWrapLine;
  const columnClass =
    styles[`legendCols${columnCount}`] ?? styles.legendCols3 ?? "";
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
            <div
              key={`${label || "legend"}-${index}`}
              className={`${styles.legendItem} ${colorClass}`}
            >
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
