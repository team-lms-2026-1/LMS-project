"use client";

import { StudentGradeDetailHeaderDto } from "@/features/curricular-offering/api/types";
import styles from "./GradeDetailInfoSection.module.css";
import { useI18n } from "@/i18n/useI18n";

type Props = { data: StudentGradeDetailHeaderDto };

export function GradeDetailInfoSection({ data }: Props) {
  const t = useI18n("curricular.adminGrades.detail.info");

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerRow}>
          {/* 왼쪽: 이름/학번 */}
          <div className={styles.sectionTitle}>
            {data.studentName}{" "}
            <span className={styles.studentNo}>({data.studentNo})</span>
          </div>

          {/* 오른쪽 끝: 학과/학년 */}
          <div className={styles.headerMeta}>
            <span className={styles.metaItem}>{data.deptName}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.metaItem}>{t("gradeLevel", { value: data.gradeLevel })}</span>
          </div>
        </div>
      </div>

      {/* Body */}
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
  const displayValue =
    format === "gpa" ? formatGpa(value) : formatInt(value);

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
  // ✅ 소수점 2자리 고정 (원하면 1자리로 바꿔도 됨)
  return v.toFixed(2);
}

function formatInt(v: number) {
  if (Number.isNaN(v)) return "0";
  // 정수 표기 (혹시 number로 들어와도 안전)
  return String(Math.trunc(v));
}
