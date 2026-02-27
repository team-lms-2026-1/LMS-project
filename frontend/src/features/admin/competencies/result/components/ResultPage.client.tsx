"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./ResultPage.module.css";
import { useResultList } from "@/features/admin/competencies/result/hooks/useResultList";
import { recalculateCompetencySummary } from "@/features/admin/competencies/result/api/ResultCompetenciesApi";
import type {
  ResultCompetencyDashboard,
  ResultCompetencyRadarItem,
  ResultCompetencyRadarSeries,
  ResultCompetencyStatRow,
} from "@/features/admin/competencies/result/api/types";
import { Button } from "@/components/button";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useDeptsDropdownOptions } from "@/features/dropdowns/depts/hooks";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { useSearchParams } from "next/navigation";
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
const ALL_DEPT_VALUE = "ALL";

type NormalizedRadarSeries = {
  deptName: string;
  items: { name: string; value: number }[];
};

type TrendSeries = {
  name: string;
  data: number[];
};

type RadarFallbackLabels = {
  allLabel: string;
  deptPrefix: string;
  competencyPrefix: string;
};

export default function ResultPageClient() {
  const t = useI18n("competency.adminResult.detail");
  const searchParams = useSearchParams();
  const semesterIdParam = searchParams.get("semesterId")?.trim() ?? "";
  const semesterNameParam = searchParams.get("semesterName")?.trim() ?? "";
  const statusParam = searchParams.get("status");
  const { options: deptOptionsRaw, loading: deptLoading } = useDeptsDropdownOptions();
  const { options: semesterOptions, loading: semesterLoading } = useSemestersDropdownOptions();
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);
  const [trendDeptValue, setTrendDeptValue] = useState("");
  const [radarDeptValue, setRadarDeptValue] = useState(ALL_DEPT_VALUE);

  const allLabel = t("fallback.all");
  const deptPrefix = t("fallback.deptPrefix");
  const competencyPrefix = t("fallback.competencyPrefix");

  const resolvedSemesterId = useMemo(() => {
    if (semesterIdParam) return semesterIdParam;
    if (!semesterNameParam) return "";

    const normalize = (value: string) =>
      value
        .replace(/\s+/g, "")
        .replace(/\uB144|\uD559\uAE30|\u5E74|\u5B66\u671F/g, "")
        .replace(/year|semester/gi, "")
        .replace(/-/g, "")
        .toLowerCase();

    const target = normalize(semesterNameParam);
    const match = semesterOptions.find((opt) => normalize(opt.label) === target);
    return match?.value ?? "";
  }, [semesterIdParam, semesterNameParam, semesterOptions]);

  const [radarSemesterId, setRadarSemesterId] = useState(() => resolvedSemesterId || "");

  useEffect(() => {
    if (resolvedSemesterId && !radarSemesterId) {
      setRadarSemesterId(resolvedSemesterId);
    }
  }, [resolvedSemesterId, radarSemesterId]);

  const isClosed = String(statusParam ?? "").toUpperCase() === "CLOSED";

  const query = useMemo(() => {
    const semesterQuery = semesterIdParam
      ? { semesterId: semesterIdParam }
      : semesterNameParam
        ? { semesterName: semesterNameParam }
        : {};
    return semesterQuery;
  }, [semesterIdParam, semesterNameParam]);

  const messages = useMemo(
    () => ({
      loadFailed: t("messages.loadFailed"),
    }),
    [t]
  );

  const { state, actions } = useResultList(query, true, messages);
  const radarQuery = useMemo(
    () => (radarSemesterId ? { semesterId: radarSemesterId } : undefined),
    [radarSemesterId]
  );
  const radarEnabled = Boolean(radarSemesterId) && radarSemesterId !== resolvedSemesterId;
  const { state: radarState } = useResultList(radarQuery, radarEnabled, messages);
  const radarLoading = radarEnabled ? radarState.loading : false;
  const radarError = radarEnabled ? radarState.error : null;
  const radarSourceData = radarEnabled ? radarState.data : state.data;

  const handleRecalculate = async () => {
    if (!isClosed || recalcLoading) return;
    const semesterIdValue = resolvedSemesterId || "";

    if (!semesterIdValue) {
      setRecalcError(t("messages.semesterNotFound"));
      return;
    }

    setRecalcLoading(true);
    setRecalcError(null);
    try {
      await recalculateCompetencySummary(semesterIdValue);
      await actions.reload();
    } catch (e: any) {
      setRecalcError(e?.message ?? t("messages.recalculateFailed"));
    } finally {
      setRecalcLoading(false);
    }
  };

  const summary = useMemo(() => normalizeSummary(state.data), [state.data]);
  const baseRadarSeries = useMemo(
    () =>
      normalizeRadarSeries(state.data, {
        allLabel,
        deptPrefix,
        competencyPrefix,
      }),
    [state.data, allLabel, deptPrefix, competencyPrefix]
  );
  const radarSeries = useMemo(
    () =>
      normalizeRadarSeries(radarSourceData, {
        allLabel,
        deptPrefix,
        competencyPrefix,
      }),
    [radarSourceData, allLabel, deptPrefix, competencyPrefix]
  );

  const isAllDeptLabel = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return false;
    const upper = trimmed.toUpperCase();
    return (
      upper === "ALL" ||
      trimmed === allLabel ||
      trimmed === "\uC804\uCCB4" ||
      trimmed === "\u5168\u4F53"
    );
  };

  const radarDeptOptions = useMemo(() => {
    const names = new Set<string>();
    deptOptionsRaw.forEach((opt) => {
      const label = String(opt.label ?? "").trim();
      if (label && !isAllDeptLabel(label)) names.add(label);
    });

    const data = radarSourceData;
    const rawDepts = [
      ...(Array.isArray(data?.deptNames) ? data?.deptNames : []),
      ...(Array.isArray(data?.departments) ? data?.departments : []),
    ];
    rawDepts.forEach((d) => {
      const label = typeof d === "string" ? d.trim() : "";
      if (label && !isAllDeptLabel(label)) names.add(label);
    });

    radarSeries.forEach((s) => {
      const label = String(s.deptName ?? "").trim();
      if (label && !isAllDeptLabel(label)) names.add(label);
    });

    const sorted = Array.from(names)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return sorted.map((dept) => ({ value: dept, label: dept }));
  }, [deptOptionsRaw, radarSourceData, radarSeries, allLabel]);

  useEffect(() => {
    if (radarDeptValue === ALL_DEPT_VALUE) return;
    const exists = radarDeptOptions.some((opt) => opt.value === radarDeptValue);
    if (!exists) setRadarDeptValue(ALL_DEPT_VALUE);
  }, [radarDeptOptions, radarDeptValue]);

  const trendDeptOptions = useMemo(() => {
    const names = new Set<string>();
    deptOptionsRaw.forEach((opt) => {
      const label = String(opt.label ?? "").trim();
      if (label && !isAllDeptLabel(label)) names.add(label);
    });
    const data = state.data;
    const rawDepts = [
      ...(Array.isArray(data?.deptNames) ? data?.deptNames : []),
      ...(Array.isArray(data?.departments) ? data?.departments : []),
    ];
    rawDepts.forEach((d) => {
      if (typeof d === "string" && d.trim() && !isAllDeptLabel(d)) names.add(d.trim());
    });
    baseRadarSeries.forEach((s) => {
      if (s.deptName && !isAllDeptLabel(String(s.deptName))) {
        names.add(String(s.deptName).trim());
      }
    });
    return Array.from(names)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((dept) => ({ value: dept, label: dept }));
  }, [deptOptionsRaw, state.data, baseRadarSeries, allLabel]);

  const isTrendDeptSelected = Boolean(trendDeptValue.trim());

  const filteredRadarSeries = useMemo(() => {
    if (radarDeptValue === ALL_DEPT_VALUE) return radarSeries;
    return radarSeries.filter((s) => s.deptName === radarDeptValue);
  }, [radarSeries, radarDeptValue]);

  const radarData = useMemo(() => buildRadarData(filteredRadarSeries), [filteredRadarSeries]);
  const isSingleRadarSeries = filteredRadarSeries.length <= 1;

  const trendSeries = useMemo(() => normalizeTrendSeries(state.data), [state.data]);
  const filteredTrendSeries = useMemo(() => {
    if (!isTrendDeptSelected) return [];
    const prefix = `${trendDeptValue} -`;
    return trendSeries.filter((s) => s.name === trendDeptValue || s.name.startsWith(prefix));
  }, [trendSeries, isTrendDeptSelected, trendDeptValue]);

  const trendData = useMemo(
    () => normalizeTrendData(state.data, filteredTrendSeries),
    [state.data, filteredTrendSeries]
  );

  const trendYAxis = useMemo(() => {
    if (filteredTrendSeries.length === 0) return undefined;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    filteredTrendSeries.forEach((series) => {
      series.data.forEach((value) => {
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

    return {
      domain: [minTick, maxTick] as [number, number],
      ticks,
    };
  }, [filteredTrendSeries]);

  const statsRows = useMemo(
    () => normalizeStats(state.data, competencyPrefix),
    [state.data, competencyPrefix]
  );

  if (state.loading || recalcLoading) {
    return <div className={styles.page}>{t("loadingText")}</div>;
  }

  if (state.error || recalcError) {
    return <div className={styles.page}>{state.error ?? recalcError}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>{t("title")}</h1>
          <div className={styles.topActions}>
            {isClosed && (
              <Button
                variant="primary"
                onClick={handleRecalculate}
                disabled={recalcLoading || !resolvedSemesterId}
              >
                {t("buttons.recalculate")}
              </Button>
            )}
          </div>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>{t("summary.totalTargets")}</div>
            <div className={styles.summaryValue}>{formatNumber(summary.totalCount)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>{t("summary.calculatedTargets")}</div>
            <div className={styles.summaryValue}>{formatNumber(summary.calculatedCount)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>{t("summary.average")}</div>
            <div className={styles.summaryValue}>{formatScore(summary.averageScore)}</div>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{t("panels.radar")}</h2>
              <div className={styles.filterGroup}>
                <div className={styles.filterWrap}>
                  <span className={styles.filterLabel}>{t("filters.semester")}</span>
                  <Dropdown
                    value={radarSemesterId}
                    onChange={setRadarSemesterId}
                    options={semesterOptions}
                    placeholder={t("filters.semester")}
                    loading={semesterLoading}
                    className={styles.dropdownWrap}
                  />
                </div>
                <div className={styles.filterWrap}>
                  <span className={styles.filterLabel}>{t("filters.dept")}</span>
                  <Dropdown
                    value={radarDeptValue}
                    onChange={setRadarDeptValue}
                    options={radarDeptOptions}
                    placeholder={t("filters.dept")}
                    loading={deptLoading}
                    className={styles.dropdownWrap}
                  />
                </div>
              </div>
            </div>
            <div className={styles.chartWrap}>
              {radarLoading ? (
                <div className={styles.emptyCentered}>{t("loadingText")}</div>
              ) : radarError ? (
                <div className={styles.empty}>{radarError}</div>
              ) : radarData.length === 0 ? (
                <div className={styles.empty}>{t("empty.chartData")}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius={RADAR_OUTER_RADIUS} margin={RADAR_CHART_MARGIN}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={{ className: styles.radarTick }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Tooltip formatter={(v: number | string | undefined) => formatScore(v)} />
                    <Legend verticalAlign="bottom" height={12} content={renderRadarLegend} />
                    {filteredRadarSeries.map((series, index) => (
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
              <h2 className={styles.panelTitle}>{t("panels.trend")}</h2>
              <div className={styles.filterWrap}>
                <span className={styles.filterLabel}>{t("filters.dept")}</span>
                <Dropdown
                  value={trendDeptValue}
                  onChange={setTrendDeptValue}
                  options={trendDeptOptions}
                  placeholder={t("filters.selectDept")}
                  loading={deptLoading}
                  className={styles.dropdownWrap}
                />
              </div>
            </div>
            <div className={styles.chartWrap}>
              {!isTrendDeptSelected ? (
                <div className={styles.emptyCentered}>{t("empty.selectDept")}</div>
              ) : trendData.length === 0 || filteredTrendSeries.length === 0 ? (
                <div className={styles.empty}>{t("empty.chartData")}</div>
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
            <h2 className={styles.panelTitle}>{t("panels.stats")}</h2>
          </div>
          <div className={styles.tableWrap}>
            {statsRows.length === 0 ? (
              <div className={styles.empty}>{t("empty.statsData")}</div>
            ) : (
              <table className={styles.statTable}>
                <thead>
                  <tr>
                    <th>{t("table.headers.competencyName")}</th>
                    <th>{t("table.headers.targetAndCalculated")}</th>
                    <th>{t("table.headers.average")}</th>
                    <th>{t("table.headers.median")}</th>
                    <th>{t("table.headers.stdDev")}</th>
                    <th>{t("table.headers.calculatedAt")}</th>
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

function normalizeRadarSeries(
  data: ResultCompetencyDashboard | null,
  labels: RadarFallbackLabels
): NormalizedRadarSeries[] {
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
        deptName: labels.allLabel,
        items: normalizeRadarItems(raw, labels.competencyPrefix),
      },
    ];
  }

  return raw
    .map((series: ResultCompetencyRadarSeries, idx: number) => {
      const name =
        pickString(series, ["deptName", "department", "dept", "name", "label"]) ||
        `${labels.deptPrefix} ${idx + 1}`;
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
        items: normalizeRadarItems(itemsRaw, labels.competencyPrefix),
      };
    })
    .filter((s) => s.items.length > 0);
}

function normalizeRadarItems(items: ResultCompetencyRadarItem[] | any, competencyPrefix: string) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    name: pickString(item, ["name", "label", "competencyName"]) || `${competencyPrefix} ${index + 1}`,
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

function normalizeTrendSeries(data: ResultCompetencyDashboard | null): TrendSeries[] {
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

function normalizeStats(data: ResultCompetencyDashboard | null, competencyPrefix: string) {
  const raw =
    (data as any)?.statsTable ??
    (data as any)?.table ??
    (data as any)?.rows ??
    (data as any)?.items ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw.map((row: ResultCompetencyStatRow, idx: number) => ({
    key: `${pickString(row, ["name", "competencyName"]) || "row"}-${idx}`,
    name: pickString(row, ["name", "competencyName"]) || `${competencyPrefix} ${idx + 1}`,
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
