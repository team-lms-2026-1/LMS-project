"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import styles from "./ProfessorOfferingCompetencyRadarChart.module.css";

type CompetencyItem = {
  competencyId: number;
  name: string;
  weight: number | null;
};

type Props = {
  items: CompetencyItem[];
};

export function ProfessorOfferingCompetencyRadarChart({ items }: Props) {
  const data = items.map((c) => ({
    name: c.name,
    value: c.weight ?? 0,
  }));

  const hasAnyValue = data.some((d) => d.value > 0);

  if (!hasAnyValue) {
    return <div className={styles.empty}>등록된 역량 점수가 없습니다.</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 6]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
          <Tooltip formatter={(v) => `${v}점`} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
