"use client";

import { useI18n } from "@/i18n/useI18n";
import { StudentGradeDetailHeaderDto } from "@/features/curricular-offering/api/types";
import styles from "./GradeInfoMeSection.module.css";

type Props = { data: StudentGradeDetailHeaderDto };

export function GradeInfoMeSection({ data }: Props) {
  const t = useI18n("curricular.adminGrades.detail.info");

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
          <Metric label={t("metrics.maxGpa")} value={data.maxSemesterGpa} format="gpa" />
          <Metric label={t("metrics.overallGpa")} value={data.overallGpa} format="gpa" />
          <Metric
            label={t("metrics.totalEarnedCredits")}
            value={data.totalEarnedCredits}
            suffix={t("creditUnit")}
            format="int"
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
  format,
}: {
  label: string;
  value: number;
  suffix?: string;
  format: "gpa" | "int";
}) {
  const displayValue = format === "gpa" ? formatGpa(value) : formatInt(value);

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

function formatGpa(v: number) {
  if (Number.isNaN(v)) return "0.00";
  return v.toFixed(2);
}

function formatInt(v: number) {
  if (Number.isNaN(v)) return "0";
  return String(Math.trunc(v));
}
