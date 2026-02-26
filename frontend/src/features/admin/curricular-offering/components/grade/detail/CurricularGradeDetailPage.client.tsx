"use client";

import { useParams, useRouter } from "next/navigation";
import styles from "./CurricularGradeDetailPage.module.css";
import { useCurricularGradeDetailHeader } from "@/features/admin/curricular-offering/hooks/useCurricularGradeList";
import { GradeDetailInfoSection } from "./components/GradeDetailInfoSection";
import { GradeTrendChartSection } from "./components/GradeTrendChartSection";
import { GradeDetailListSection } from "./components/GradeDetailListSection";
import { useI18n } from "@/i18n/useI18n";


export function CurricularGradeDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ studentAccountId: string }>();
  const studentAccountId = Number(params.studentAccountId);
  const t = useI18n("curricular.adminGrades.detail.page");

  const { state } = useCurricularGradeDetailHeader(
    Number.isFinite(studentAccountId) ? studentAccountId : undefined,
    true
  );

  const { data, loading, error } = state;

  if (!Number.isFinite(studentAccountId)) {
    return <div className={styles.page}>{t("invalidAccess")}</div>;
  }

  if (loading) return <div className={styles.page}>{t("loading")}</div>;
  if (error) return <div className={styles.page}>{t("loadError")}</div>;
  if (!data) return <div className={styles.page}>{t("empty")}</div>;

  return (
    <div className={styles.page}>
      {/* 상단 바 */}
      <div className={styles.topBar}>
        <div className={styles.title}>{t("title")}</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          {t("backButton")} →
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
