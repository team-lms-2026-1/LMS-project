"use client";

import { useI18n } from "@/i18n/useI18n";
import { StudentGradeDetailHeaderDto } from "@/features/curricular-offering/api/types";
import styles from "./GradeTrendChartMeSection.module.css";
import { GradeTrendComposedMeChart } from "./GradeTrendComposedMeChart";

type Props = { data: StudentGradeDetailHeaderDto };

export function GradeTrendChartMeSection({ data }: Props) {
  const t = useI18n("curricular.adminGrades.detail.trend");

  return (
    <div className={styles.section}>
      <Header title={t("title")} />
      <div className={styles.body}>
        <GradeTrendComposedMeChart items={data.trend ?? []} />
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
