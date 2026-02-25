"use client";

import { useI18n } from "@/i18n/useI18n";
import { useStudentExtraGradeMeHeader } from "../../hooks/useExtraCurricularGradeReports";
import { ExtraGradeInfoMeSection } from "./component/ExtraGradeInfoMeSection";
import { ExtraGradeTrendChartMeSection } from "./component/ExtraGradeTrendChartMeSection";
import { ExtraGradeListMeSection } from "./component/ExtraGradeListMeSection";
import styles from "./StudentExtraCurricularGradeMePage.client.module.css";

export function StudentExtraCurricularGradeMePageClient() {
  const t = useI18n("extraCurricular.adminGrades.detail.page");
  const { state } = useStudentExtraGradeMeHeader(true);
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
          <ExtraGradeInfoMeSection data={data} />
          <ExtraGradeTrendChartMeSection data={data} />
        </div>

        <div className={styles.rightCol}>
          <ExtraGradeListMeSection />
        </div>
      </div>
    </div>
  );
}
