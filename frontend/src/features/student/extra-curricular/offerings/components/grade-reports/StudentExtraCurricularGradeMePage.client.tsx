"use client";

import styles from "./StudentExtraCurricularGradeMePage.client.module.css";
import { useStudentExtraGradeMeHeader } from "../../hooks/useExtraCurricularGradeReports";
import { ExtraGradeInfoMeSection } from "./component/ExtraGradeInfoMeSection";
import { ExtraGradeTrendChartMeSection } from "./component/ExtraGradeTrendChartMeSection";
import { ExtraGradeListMeSection } from "./component/ExtraGradeListMeSection";

export function StudentExtraCurricularGradeMePageClient() {
  const { state } = useStudentExtraGradeMeHeader(true);

  const { data, loading, error } = state;

  if (loading) return <div className={styles.page}>불러오는 중...</div>;
  if (error) return <div className={styles.page}>오류가 발생했습니다.</div>;
  if (!data) return <div className={styles.page}>데이터가 없습니다.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.title}>비교과 성적</div>
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
