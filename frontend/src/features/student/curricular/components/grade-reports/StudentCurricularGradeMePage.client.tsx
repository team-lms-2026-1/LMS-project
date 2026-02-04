"use client";

import { useParams, useRouter } from "next/navigation";
import styles from "./StudentCurricularGradeMePage.client.module.css"
import { useCurricularGradeMeHeader } from "../../hooks/useCurricularGradeReports";
import { GradeInfoMeSection } from "./component/GradeInfoMeSection";
import { GradeTrendChartMeSection } from "./component/GradeTrendChartMeSection";
import { GradeListMeSection } from "./component/GradeListMeSection";

export function StudentCurricularGradeMePageClient() {
  const router = useRouter();

  const { state } = useCurricularGradeMeHeader(true);

  const { data, loading, error } = state;

  if (loading) return <div className={styles.page}>불러오는 중...</div>;
  if (error) return <div className={styles.page}>에러가 발생했습니다.</div>;
  if (!data) return <div className={styles.page}>데이터가 없습니다.</div>;

  return (
    <div className={styles.page}>
      {/* 상단 바 */}
      <div className={styles.topBar}>
        <div className={styles.title}>교과 성적</div>
      </div>

      {/* 본문 3:2 */}
      <div className={styles.mainRow}>
        {/* 왼쪽 3 */}
        <div className={styles.leftCol}>
          <GradeInfoMeSection data={data} />
          <GradeTrendChartMeSection data={data} />
        </div>

        {/* 오른쪽 2 */}
        <div className={styles.rightCol}>
          <GradeListMeSection />
        </div>
      </div>
    </div>
  );
}
