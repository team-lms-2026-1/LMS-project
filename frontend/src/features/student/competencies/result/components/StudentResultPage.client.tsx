"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentResultPage.module.css";
import { useStudentResult } from "../hooks/useStudentResult";
import type {
  StudentCompetencyRadarItem,
  StudentCompetencyStatRow,
  StudentCompetencyTrendSeries,
} from "../api/types";
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

const LINE_COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#e11d48", "#0ea5e9"];

export default function StudentResultPageClient() {
  const t = useI18n("competency.studentResult.detail");
  const { state } = useStudentResult({
    loadFailed: t("messages.loadFailed"),
  });
  const { data, loading, error } = state;

  const profile = data?.profile;
  const summary = data?.summary;
  const isEmpty = data ? isEmptyDashboard(data) : false;
  const competencyPrefix = t("fallback.competencyPrefix");

  const radarData = useMemo(
    () => normalizeRadar(data?.radarChart ?? [], competencyPrefix),
    [data?.radarChart, competencyPrefix]
  );
  const trendSeries = data?.trendChart?.series ?? [];
  const trendData = useMemo(
    () => normalizeTrend(data?.trendChart?.categories ?? [], trendSeries),
    [data?.trendChart?.categories, trendSeries]
  );

  const myStatsRows = useMemo(
    () => normalizeMyStats(data?.myStatsTable ?? [], competencyPrefix),
    [data?.myStatsTable, competencyPrefix]
  );
  const comparisonRows = useMemo(
    () => normalizeMyStats(data?.comparisonTable ?? data?.myStatsTable ?? [], competencyPrefix),
    [data?.comparisonTable, data?.myStatsTable, competencyPrefix]
  );

  if (loading) {
    return <div className={styles.page}>{t("loadingText")}</div>;
  }
  if (error) {
    return <div className={styles.page}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>{t("title")}</h1>
        </div>

        {(!data || isEmpty) && <div className={styles.empty}>{t("empty.noResult")}</div>}

        {data && !isEmpty && (
          <>
            <div className={styles.headerRow}>
              <div className={styles.sectionCard}>
                <div className={styles.profileName}>{profile?.name ?? "-"}</div>
                <div className={styles.profileMeta}>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>{t("profile.studentNumber")}</span>
                    <span className={styles.profileValue}>{profile?.studentNumber ?? "-"}</span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>{t("profile.deptName")}</span>
                    <span className={styles.profileValue}>{profile?.deptName ?? "-"}</span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>{t("profile.grade")}</span>
                    <span className={styles.profileValue}>{formatNumber(profile?.grade)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryBox}>
                    <div className={styles.summaryLabel}>{t("summary.maxScore")}</div>
                    <div className={styles.summaryValue}>{formatScore(summary?.maxScore)}</div>
                  </div>
                  <div className={styles.summaryBox}>
                    <div className={styles.summaryLabel}>{t("summary.averageScore")}</div>
                    <div className={styles.summaryValue}>{formatScore(summary?.recentAvg)}</div>
                  </div>
                  <div className={styles.summaryBox}>
                    <div className={styles.summaryLabel}>{t("summary.calculatedAt")}</div>
                    <div className={styles.summaryValue}>{formatDateTime(summary?.lastEvaluationDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>{t("panels.radar")}</h2>
                </div>
                <div className={styles.chartWrap}>
                  {radarData.length === 0 ? (
                    <div className={styles.empty}>{t("empty.chartData")}</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="80%">
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        <Radar
                          name={t("legend.myScore")}
                          dataKey="value"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.35}
                        />
                        <Tooltip formatter={(v) => formatScore(v)} />
                        <Legend
                          verticalAlign="bottom"
                          height={12}
                          wrapperStyle={{ transform: "translateY(4px)" }}
                          content={renderRadarLegend}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>{t("panels.trend")}</h2>
                </div>
                <div className={styles.chartWrap}>
                  {trendData.length === 0 || trendSeries.length === 0 ? (
                    <div className={styles.empty}>{t("empty.chartData")}</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid stroke="#eef2f6" strokeDasharray="3 3" />
                        <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#475467" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#475467" }} />
                        <Tooltip />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: 6 }}
                          content={renderLineLegend}
                        />
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

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>{t("panels.myStats")}</h2>
                </div>
                <div className={styles.tableWrap}>
                  {myStatsRows.length === 0 ? (
                    <div className={styles.empty}>{t("empty.statsData")}</div>
                  ) : (
                    <table className={styles.statTable}>
                      <thead>
                        <tr>
                          <th>{t("table.myStats.headers.competencyName")}</th>
                          <th>{t("table.myStats.headers.myScore")}</th>
                          <th>{t("table.myStats.headers.average")}</th>
                          <th>{t("table.myStats.headers.myMaxScore")}</th>
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
                  <h2 className={styles.panelTitle}>{t("panels.comparison")}</h2>
                </div>
                <div className={styles.tableWrap}>
                  {comparisonRows.length === 0 ? (
                    <div className={styles.empty}>{t("empty.statsData")}</div>
                  ) : (
                    <table className={styles.statTable}>
                      <thead>
                        <tr>
                          <th>{t("table.comparison.headers.competencyName")}</th>
                          <th>{t("table.comparison.headers.myScore")}</th>
                          <th>{t("table.comparison.headers.deptAverage")}</th>
                          <th>{t("table.comparison.headers.deptMaxScore")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((row) => (
                          <tr key={`${row.key}-comparison`}>
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
          </>
        )}
      </div>
    </div>
  );
}

function isEmptyDashboard(data: {
  radarChart?: StudentCompetencyRadarItem[];
  trendChart?: { categories?: string[]; series?: StudentCompetencyTrendSeries[] };
  myStatsTable?: StudentCompetencyStatRow[];
  comparisonTable?: StudentCompetencyStatRow[];
}) {
  const radarEmpty = !data.radarChart || data.radarChart.length === 0;
  const trendEmpty =
    !data.trendChart ||
    (data.trendChart.categories?.length ?? 0) === 0 ||
    (data.trendChart.series?.length ?? 0) === 0;
  const statsEmpty =
    (!data.myStatsTable || data.myStatsTable.length === 0) &&
    (!data.comparisonTable || data.comparisonTable.length === 0);
  return radarEmpty && trendEmpty && statsEmpty;
}

function normalizeRadar(items: StudentCompetencyRadarItem[], competencyPrefix: string) {
  return items.map((item, index) => ({
    name: pickString(item, ["name", "label", "competencyName"]) || `${competencyPrefix} ${index + 1}`,
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

function normalizeMyStats(rows: StudentCompetencyStatRow[], competencyPrefix: string) {
  return rows.map((row, idx) => ({
    key: `${pickString(row, ["name", "competencyName"]) || "row"}-${idx}`,
    name: pickString(row, ["name", "competencyName"]) || `${competencyPrefix} ${idx + 1}`,
    myScore: pickNumber(row, ["myScore", "score", "value"]),
    myAvgScore: pickNumber(row, ["myAvgScore", "myAverage"]),
    myMaxScore: pickNumber(row, ["myMaxScore", "myMaximum"]),
    avgScore: pickNumber(row, ["avgScore", "average", "avg", "deptAvgScore", "deptAverage"]),
    maxScore: pickNumber(row, ["maxScore", "maximum", "max", "deptMaxScore", "deptMaximum"]),
  }));
}

function renderCircleLegend(
  props: any,
  options: { columns?: number; showDash?: boolean } = {}
) {
  const payload = props?.payload ?? [];
  if (!payload.length) return null;
  const maxColumns = options.columns ?? payload.length;
  const columnCount = Math.max(1, Math.min(maxColumns, payload.length));
  const showDash = options.showDash ?? false;
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, max-content)`,
          gap: "2px 6px",
          justifyContent: "center",
          justifyItems: "start",
          alignItems: "center",
          width: "fit-content",
          margin: "0 auto",
        }}
      >
        {payload.map((entry: any, index: number) => {
          const color = entry?.color ?? entry?.payload?.stroke ?? "#111827";
          const label = entry?.value ?? entry?.payload?.name ?? "";
          return (
            <div
              key={`${label || "legend"}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                {showDash ? <span style={{ color, fontSize: "14px", lineHeight: 1 }}>-</span> : null}
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                />
              </span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderLineLegend(props: any) {
  return renderCircleLegend(props, { columns: 3, showDash: true });
}

function renderRadarLegend(props: any) {
  return renderCircleLegend(props, { columns: 2 });
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
