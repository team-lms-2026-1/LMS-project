"use client";

import type { ExtraGradeDetailHeaderDto } from "../../../../api/types";
import styles from "./ExtraGradeTrendChartSection.module.css";
import { ExtraGradeTrendComposedChart } from "./ExtraGradeTrendComposedChart";

type Props = { data: ExtraGradeDetailHeaderDto };

export function ExtraGradeTrendChartSection({ data }: Props) {
  return (
    <div className={styles.section}>
      <Header title="학기별 이수 포인트/시간" />
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
