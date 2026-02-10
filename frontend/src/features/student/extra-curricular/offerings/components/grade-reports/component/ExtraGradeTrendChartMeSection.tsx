"use client";

import type { StudentExtraGradeDetailHeaderDto } from "../../../api/types";
import styles from "./ExtraGradeTrendChartMeSection.module.css";
import { ExtraGradeTrendComposedMeChart } from "./ExtraGradeTrendComposedMeChart";

type Props = { data: StudentExtraGradeDetailHeaderDto };

export function ExtraGradeTrendChartMeSection({ data }: Props) {
  return (
    <div className={styles.section}>
      <Header title="학기별 이수 포인트/시간" />
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
