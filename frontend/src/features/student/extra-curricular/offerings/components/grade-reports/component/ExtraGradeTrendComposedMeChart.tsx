"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/i18n/useI18n";
import { useLocale } from "@/hooks/useLocale";
import { localizeSemesterOptionLabel } from "@/features/dropdowns/semesters/localeLabel";
import type { StudentExtraGradeTrendItemDto } from "../../../api/types";
import styles from "./ExtraGradeTrendComposedMeChart.module.css";

type Props = {
  items: StudentExtraGradeTrendItemDto[];
};

export function ExtraGradeTrendComposedMeChart({ items }: Props) {
  const t = useI18n("extraCurricular.adminGrades.detail.trend");
  const { locale } = useLocale();

  const chartData = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        semesterLabel: localizeSemesterOptionLabel(item.semesterName, locale),
      })),
    [items, locale]
  );

  if (!items.length) {
    return <div className={styles.empty}>{t("empty")}</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid stroke="#eef2f6" strokeDasharray="3 3" />
          <XAxis dataKey="semesterLabel" tick={{ fontSize: 13, fill: "#475467" }} />
          <YAxis yAxisId="points" tick={{ fontSize: 13, fill: "#475467" }} allowDecimals={false} />
          <YAxis
            yAxisId="hours"
            orientation="right"
            tick={{ fontSize: 13, fill: "#475467" }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="points"
            dataKey="semesterEarnedPoints"
            barSize={36}
            fill="#93c5fd"
            radius={[6, 6, 0, 0]}
          />
          <Line
            yAxisId="hours"
            type="monotone"
            dataKey="semesterEarnedHours"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  const t = useI18n("extraCurricular.adminGrades.detail.trend.tooltip");

  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{data.semesterLabel ?? data.semesterName}</div>
      <div className={styles.tooltipRow}>{t("earnedPoints", { value: data.semesterEarnedPoints })}</div>
      <div className={styles.tooltipRow}>{t("earnedHours", { value: data.semesterEarnedHours })}</div>
    </div>
  );
}
