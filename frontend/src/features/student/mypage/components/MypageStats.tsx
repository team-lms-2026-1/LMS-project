import { useI18n } from "@/i18n/useI18n";
import type { StudentMypageResponse } from "../api/types";
import styles from "./Mypage.module.css";

interface Props {
  data: StudentMypageResponse;
}

export default function MypageStats({ data }: Props) {
  const t = useI18n("mypage.student.stats");

  const stats = [
    { label: t("labels.totalCredits"), value: data.totalCredits, unit: t("units.credits") },
    { label: t("labels.averageScore"), value: data.averageScore.toFixed(2), unit: t("units.score") },
    { label: t("labels.totalExtraPoints"), value: data.totalExtraPoints, unit: t("units.points") },
    { label: t("labels.totalExtraHours"), value: data.totalExtraHours, unit: t("units.hours") },
  ];

  return (
    <div className={`${styles.statsGrid} ${styles.section}`}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <dt className={styles.statLabel}>{stat.label}</dt>
          <dd className={styles.statValue}>
            {stat.value}
            <span className={styles.statUnit}>{stat.unit}</span>
          </dd>
        </div>
      ))}
    </div>
  );
}
