"use client";

import { StudentGradeDetailHeaderDto } from "@/features/admin/curricular-offering/api/types";
import styles from "./GradeTreandChartSection.module.css";
import { GradeTrendComposedChart } from "./GradeTrendComposedChart";
import { useI18n } from "@/i18n/useI18n";

type Props = { data: StudentGradeDetailHeaderDto };

export function GradeTrendChartSection({ data }: Props) {
  const t = useI18n("curricular.adminGrades.detail.trend");

  return (
    <div className={styles.section}>
      <Header title={t("title")} />
      <div className={styles.body}>
        <GradeTrendComposedChart items={data.trend ?? []} />
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
