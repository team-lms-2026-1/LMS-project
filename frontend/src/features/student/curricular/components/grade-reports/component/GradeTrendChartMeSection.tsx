"use client";

import { StudentGradeDetailHeaderDto } from "@/features/curricular-offering/api/types";
import styles from "./GradeTrendChartMeSection.module.css";
import { GradeTrendComposedMeChart } from "./GradeTrendComposedMeChart";

type Props = { data: StudentGradeDetailHeaderDto };

export function GradeTrendChartMeSection({ data }: Props) {
  return (
    <div className={styles.section}>
      <Header title="학기별 성적 추이" />
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
