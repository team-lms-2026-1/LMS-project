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

const LINE_COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#e11d48", "#0ea5e9"];

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

  const radarData = useMemo(() => normalizeRadar(data?.radarChart ?? []), [data?.radarChart]);
  const trendSeries = data?.trendChart?.series ?? [];
  const trendData = useMemo(
    () => normalizeTrend(data?.trendChart?.categories ?? [], trendSeries),
    [data?.trendChart?.categories, trendSeries]
  );

  const myStatsRows = useMemo(
    () => normalizeMyStats(data?.myStatsTable ?? []),
    [data?.myStatsTable]
  );
  const comparisonRows = useMemo(
    () => normalizeComparisonStats(data?.comparisonTable ?? []),
    [data?.comparisonTable]
  );

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
                <div className={styles.summaryValue}>{formatScore(summary?.maxScore)}</div>
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
                  <RadarChart data={radarData} outerRadius="80%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
                    <Tooltip formatter={(v) => formatScore(v)} />
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>내 역량 통계</h2>
            </div>
            <div className={styles.tableWrap}>
              {myStatsRows.length === 0 ? (
                <div className={styles.empty}>통계 데이터가 없습니다.</div>
              ) : (
                <table className={styles.statTable}>
                  <thead>
                    <tr>
                      <th>역량 이름</th>
                      <th>내점수</th>
                      <th>평균</th>
                      <th>최고점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStatsRows.map((row) => (
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>내 역량 비교</h2>
            </div>
            <div className={styles.tableWrap}>
              {comparisonRows.length === 0 ? (
                <div className={styles.empty}>비교 데이터가 없습니다.</div>
              ) : (
                <table className={styles.statTable}>
                  <thead>
                    <tr>
                      <th>역량 이름</th>
                      <th>내점수</th>
                      <th>학과평균</th>
                      <th>학과최고점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.name}</td>
                        <td>{formatScore(row.myScore)}</td>
                        <td>{formatScore(row.deptAvgScore)}</td>
                        <td>{formatScore(row.deptMaxScore)}</td>
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
    name: pickString(item, ["name", "label", "competencyName"]) || `항목 ${index + 1}`,
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
    name: pickString(row, ["name", "competencyName"]) || `항목 ${idx + 1}`,
    myScore: pickNumber(row, ["myScore", "score", "value"]),
    avgScore: pickNumber(row, ["avgScore", "average", "avg"]),
    maxScore: pickNumber(row, ["maxScore", "maximum", "max"]),
  }));
}

function normalizeComparisonStats(rows: StudentCompetencyStatRow[]) {
  return rows.map((row, idx) => ({
    key: `${pickString(row, ["name", "competencyName"]) || "row"}-${idx}`,
    name: pickString(row, ["name", "competencyName"]) || `항목 ${idx + 1}`,
    myScore: pickNumber(row, ["myScore", "score", "value"]),
    deptAvgScore: pickNumber(row, ["deptAvgScore", "departmentAvg", "avgScore", "avg"]),
    deptMaxScore: pickNumber(row, ["deptMaxScore", "departmentMax", "maxScore", "max"]),
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
