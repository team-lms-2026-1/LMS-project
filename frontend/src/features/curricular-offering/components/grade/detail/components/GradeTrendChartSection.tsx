"use client";

import { StudentGradeDetailHeaderDto } from "@/features/curricular-offering/api/types";
import styles from "./GradeTreandChartSection.module.css";
import { GradeTrendComposedChart } from "./GradeTrendComposedChart";

type Props = { data: StudentGradeDetailHeaderDto };

export function GradeTrendChartSection({ data }: Props) {
  return (
    <div className={styles.section}>
      <Header title="학기별 성적 추이" />
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
