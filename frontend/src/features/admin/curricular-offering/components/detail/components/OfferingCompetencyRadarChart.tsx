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

import styles from "./OfferingCompetencyRadarChart.module.css";
import { useI18n } from "@/i18n/useI18n";
import { useLocale } from "@/hooks/useLocale";
import { getLocalizedCompetencyName } from "@/features/admin/competencies/utils/competencyLocale";

type CompetencyItem = {
  competencyId: number;
  code: string;
  name: string;
  weight: number | null;
};

type Props = {
  items: CompetencyItem[];
};

export function OfferingCompetencyRadarChart({ items }: Props) {
  const t = useI18n("curricular.adminOfferingDetail.radar");
  const { locale } = useLocale();

  const data = items.map((c) => ({
    name: getLocalizedCompetencyName(c.code, locale, c.name),
    value: c.weight ?? 0,
  }));

  const hasAnyValue = data.some((d) => d.value > 0);

  if (!hasAnyValue) {
    return <div className={styles.empty}>{t("empty")}</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid />

          {/* ✅ 역량명 라벨 글씨 작게 */}
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
          />

          {/* ✅ 척도 숫자(0~6) 숨김 */}
          <PolarRadiusAxis domain={[0, 6]} tick={false} axisLine={false} />

          <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />

          <Tooltip
            formatter={(v) => {
              const safeValue = Array.isArray(v) ? v[0] : (v ?? 0);
              return t("tooltip", { value: safeValue });
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
