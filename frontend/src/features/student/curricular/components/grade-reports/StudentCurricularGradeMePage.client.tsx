"use client";

import { useI18n } from "@/i18n/useI18n";
import { useCurricularGradeMeHeader } from "../../hooks/useCurricularGradeReports";
import { GradeInfoMeSection } from "./component/GradeInfoMeSection";
import { GradeTrendChartMeSection } from "./component/GradeTrendChartMeSection";
import { GradeListMeSection } from "./component/GradeListMeSection";
import styles from "./StudentCurricularGradeMePage.client.module.css";

export function StudentCurricularGradeMePageClient() {
  const t = useI18n("curricular.adminGrades.detail.page");
  const { state } = useCurricularGradeMeHeader(true);
  const { data, loading, error } = state;

  if (loading) return <div className={styles.page}>{t("loading")}</div>;
  if (error) return <div className={styles.page}>{t("loadError")}</div>;
  if (!data) return <div className={styles.page}>{t("empty")}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.title}>{t("title")}</div>
      </div>

      <div className={styles.mainRow}>
        <div className={styles.leftCol}>
          <GradeInfoMeSection data={data} />
          <GradeTrendChartMeSection data={data} />
        </div>

        <div className={styles.rightCol}>
          <GradeListMeSection />
        </div>
      </div>
    </div>
  );
}
