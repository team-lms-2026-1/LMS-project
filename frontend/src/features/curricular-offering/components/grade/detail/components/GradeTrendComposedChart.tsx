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

import { StudentGradeTrendItemDto } from "@/features/curricular-offering/api/types";
import styles from "./GradeTrendComposedChart.module.css";

type Props = {
  items: StudentGradeTrendItemDto[];
};

export function GradeTrendComposedChart({ items }: Props) {
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

          {/* X축 */}
          <XAxis
            dataKey="semesterName"
            tick={{ fontSize: 13, fill: "#475467" }}
          />

          {/* GPA (왼쪽 Y축) */}
          <YAxis
            yAxisId="gpa"
            domain={[0, 5]}
            tick={{ fontSize: 13, fill: "#475467" }}
          />

          {/* 학점 (오른쪽 Y축) */}
          <YAxis
            yAxisId="credit"
            orientation="right"
            tick={{ fontSize: 13, fill: "#475467" }}
            allowDecimals={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* 학점 막대 */}
          <Bar
            yAxisId="credit"
            dataKey="semesterEarnedCredits"
            barSize={36}
            fill="#93c5fd"
            radius={[6, 6, 0, 0]}
          />

          {/* GPA 선 */}
          <Line
            yAxisId="gpa"
            type="monotone"
            dataKey="semesterGpa"
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

/* ===== Tooltip ===== */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{data.semesterName}</div>
      <div className={styles.tooltipRow}>
        GPA: {data.semesterGpa.toFixed(2)}
      </div>
      <div className={styles.tooltipRow}>
        이수학점: {data.semesterEarnedCredits}학점
      </div>
    </div>
  );
}
