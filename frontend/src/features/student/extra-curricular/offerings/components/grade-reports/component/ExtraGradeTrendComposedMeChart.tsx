"use client";

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

import type { StudentExtraGradeTrendItemDto } from "../../../api/types";
import styles from "./ExtraGradeTrendComposedMeChart.module.css";

type Props = {
  items: StudentExtraGradeTrendItemDto[];
};

export function ExtraGradeTrendComposedMeChart({ items }: Props) {
  if (!items.length) {
    return <div className={styles.empty}>차트 데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={items}
          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid stroke="#eef2f6" strokeDasharray="3 3" />

          <XAxis dataKey="semesterName" tick={{ fontSize: 13, fill: "#475467" }} />

          <YAxis
            yAxisId="points"
            tick={{ fontSize: 13, fill: "#475467" }}
            allowDecimals={false}
          />

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
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{data.semesterName}</div>
      <div className={styles.tooltipRow}>이수 포인트: {data.semesterEarnedPoints}점</div>
      <div className={styles.tooltipRow}>이수 시간: {data.semesterEarnedHours}시간</div>
    </div>
  );
}
