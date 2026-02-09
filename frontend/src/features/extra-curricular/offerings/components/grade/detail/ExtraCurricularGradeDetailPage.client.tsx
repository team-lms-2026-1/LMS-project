"use client";

import { useParams, useRouter } from "next/navigation";
import styles from "./ExtraCurricularGradeDetailPage.module.css";
import { useExtraCurricularGradeDetailHeader } from "@/features/extra-curricular/offerings/hooks/useExtraCurricularGradeList";
import { ExtraGradeDetailInfoSection } from "./components/ExtraGradeDetailInfoSection";
import { ExtraGradeTrendChartSection } from "./components/ExtraGradeTrendChartSection";
import { ExtraGradeDetailListSection } from "./components/ExtraGradeDetailListSection";

export function ExtraCurricularGradeDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ studentAccountId: string }>();
  const studentAccountId = Number(params.studentAccountId);

  const { state } = useExtraCurricularGradeDetailHeader(
    Number.isFinite(studentAccountId) ? studentAccountId : undefined,
    true
  );

  const { data, loading, error } = state;

  if (!Number.isFinite(studentAccountId)) {
    return <div className={styles.page}>잘못된 접근입니다.</div>;
  }

  if (loading) return <div className={styles.page}>불러오는 중...</div>;
  if (error) return <div className={styles.page}>오류가 발생했습니다.</div>;
  if (!data) return <div className={styles.page}>데이터가 없습니다.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.title}>비교과 성적 상세</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          목록으로
        </button>
      </div>

      <div className={styles.mainRow}>
        <div className={styles.leftCol}>
          <ExtraGradeDetailInfoSection data={data} />
          <ExtraGradeTrendChartSection data={data} />
        </div>

        <div className={styles.rightCol}>
          <ExtraGradeDetailListSection studentAccountId={studentAccountId} />
        </div>
      </div>
    </div>
  );
}
