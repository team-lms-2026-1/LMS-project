"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useI18n } from "@/i18n/useI18n";
import styles from "./OfferingCompetencyRadarChart.module.css";

type CompetencyItem = {
  competencyId: number;
  name: string;
  weight: number | null;
};

type Props = {
  items: CompetencyItem[];
};

export function OfferingCompetencyRadarChart({ items }: Props) {
  const t = useI18n("curricular.adminOfferingDetail.radar");

  const data = items.map((item) => ({
    name: item.name,
    value: item.weight ?? 0,
  }));

  const hasAnyValue = data.some((item) => item.value > 0);

  if (!hasAnyValue) {
    return <div className={styles.empty}>{t("empty")}</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 6]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
          <Tooltip formatter={(value) => t("tooltip", { value: String(value) })} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
