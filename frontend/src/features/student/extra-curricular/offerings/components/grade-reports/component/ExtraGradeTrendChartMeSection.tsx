"use client";

import { useI18n } from "@/i18n/useI18n";
import type { StudentExtraGradeDetailHeaderDto } from "../../../api/types";
import styles from "./ExtraGradeTrendChartMeSection.module.css";
import { ExtraGradeTrendComposedMeChart } from "./ExtraGradeTrendComposedMeChart";

type Props = { data: StudentExtraGradeDetailHeaderDto };

export function ExtraGradeTrendChartMeSection({ data }: Props) {
  const t = useI18n("extraCurricular.adminGrades.detail.trend");

  return (
    <div className={styles.section}>
      <Header title={t("title")} />
      <div className={styles.body}>
        <ExtraGradeTrendComposedMeChart items={data.trend ?? []} />
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
