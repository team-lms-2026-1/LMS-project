"use client";

import type { ExtraGradeDetailHeaderDto } from "../../../../api/types";
import styles from "./ExtraGradeTrendChartSection.module.css";
import { ExtraGradeTrendComposedChart } from "./ExtraGradeTrendComposedChart";
import { useI18n } from "@/i18n/useI18n";

type Props = { data: ExtraGradeDetailHeaderDto };

export function ExtraGradeTrendChartSection({ data }: Props) {
  const t = useI18n("extraCurricular.adminGrades.detail.trend");

  return (
    <div className={styles.section}>
      <Header title={t("title")} />
      <div className={styles.body}>
        <ExtraGradeTrendComposedChart items={data.trend ?? []} />
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>{title}</div>
    </div>
  );
}
