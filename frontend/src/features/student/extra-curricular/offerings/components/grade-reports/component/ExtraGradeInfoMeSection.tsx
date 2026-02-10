"use client";

import type { StudentExtraGradeDetailHeaderDto } from "../../../api/types";
import styles from "./ExtraGradeInfoMeSection.module.css";

type Props = { data: StudentExtraGradeDetailHeaderDto };

export function ExtraGradeInfoMeSection({ data }: Props) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerRow}>
          <div className={styles.sectionTitle}>
            {data.studentName} <span className={styles.studentNo}>({data.studentNo})</span>
          </div>

          <div className={styles.headerMeta}>
            <span className={styles.metaItem}>{data.deptName}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.metaItem}>{data.gradeLevel}학년</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.metrics}>
          <Metric label="총이수 포인트" value={data.totalEarnedPoints} suffix="점" />
          <Metric label="총이수 시간" value={data.totalEarnedHours} suffix="시간" />
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const displayValue = formatInt(value);

  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>
        {displayValue}
        {suffix ? <span className={styles.metricSuffix}> {suffix}</span> : null}
      </div>
    </div>
  );
}

function formatInt(v: number) {
  if (Number.isNaN(v)) return "0";
  return String(Math.trunc(v));
}
