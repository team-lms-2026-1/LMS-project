"use client";

import { useParams, useRouter } from "next/navigation";
import styles from "./CurricularGradeDetailPage.module.css";
import { useCurricularGradeDetailHeader } from "@/features/curricular-offering/hooks/useCurricularGradeList";
import { GradeDetailInfoSection } from "./components/GradeDetailInfoSection";
import { GradeTrendChartSection } from "./components/GradeTrendChartSection";
import { GradeDetailListSection } from "./components/GradeDetailListSection";


export function CurricularGradeDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ studentAccountId: string }>();
  const studentAccountId = Number(params.studentAccountId);

  const { state } = useCurricularGradeDetailHeader(
    Number.isFinite(studentAccountId) ? studentAccountId : undefined,
    true
  );

  const { data, loading, error } = state;

  if (!Number.isFinite(studentAccountId)) {
    return <div className={styles.page}>잘못된 접근입니다.</div>;
  }

  if (loading) return <div className={styles.page}>불러오는 중...</div>;
  if (error) return <div className={styles.page}>에러가 발생했습니다.</div>;
  if (!data) return <div className={styles.page}>데이터가 없습니다.</div>;

  return (
    <div className={styles.page}>
      {/* 상단 바 */}
      <div className={styles.topBar}>
        <div className={styles.title}>교과 성적 상세</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          목록 →
        </button>
      </div>

      {/* 본문 3:2 */}
      <div className={styles.mainRow}>
        {/* 왼쪽 3 */}
        <div className={styles.leftCol}>
          <GradeDetailInfoSection data={data} />
          <GradeTrendChartSection data={data} />
        </div>

        {/* 오른쪽 2 */}
        <div className={styles.rightCol}>
          <GradeDetailListSection studentAccountId={studentAccountId}/>
        </div>
      </div>
    </div>
  );
}
