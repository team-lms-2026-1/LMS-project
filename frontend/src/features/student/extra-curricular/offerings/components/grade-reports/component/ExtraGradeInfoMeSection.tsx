"use client";

import { useI18n } from "@/i18n/useI18n";
import type { StudentExtraGradeDetailHeaderDto } from "../../../api/types";
import styles from "./ExtraGradeInfoMeSection.module.css";

type Props = { data: StudentExtraGradeDetailHeaderDto };

export function ExtraGradeInfoMeSection({ data }: Props) {
  const t = useI18n("extraCurricular.adminGrades.detail.info");

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerRow}>
          <div className={styles.sectionTitle}>
            {data.studentName} <span className={styles.studentNo}>({data.studentNo})</span>
          </div>

          <div className={styles.headerMeta}>
            <span className={styles.metaItem}>{data.deptName}</span>
            <span className={styles.dot}>/</span>
            <span className={styles.metaItem}>{t("gradeLevel", { value: data.gradeLevel })}</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.metrics}>
          <Metric
            label={t("metrics.totalEarnedPoints")}
            value={data.totalEarnedPoints}
            suffix={t("pointUnit")}
          />
          <Metric
            label={t("metrics.totalEarnedHours")}
            value={data.totalEarnedHours}
            suffix={t("hourUnit")}
          />
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
