"use client";

import { useParams, useRouter } from "next/navigation";
import styles from "./ExtraCurricularGradeDetailPage.module.css";
import { useExtraCurricularGradeDetailHeader } from "@/features/extra-curricular/offerings/hooks/useExtraCurricularGradeList";
import { ExtraGradeDetailInfoSection } from "./components/ExtraGradeDetailInfoSection";
import { ExtraGradeTrendChartSection } from "./components/ExtraGradeTrendChartSection";
import { ExtraGradeDetailListSection } from "./components/ExtraGradeDetailListSection";
import { useI18n } from "@/i18n/useI18n";

export function ExtraCurricularGradeDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ studentAccountId: string }>();
  const studentAccountId = Number(params.studentAccountId);
  const t = useI18n("extraCurricular.adminGrades.detail.page");

  const { state } = useExtraCurricularGradeDetailHeader(
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
      <div className={styles.topBar}>
        <div className={styles.title}>{t("title")}</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          {t("backButton")}
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
