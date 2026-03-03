"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./StudentExtraCurricularOfferingDetailPage.module.css";
import { useExtraCurricularDetail } from "../../hooks/useExtraCurricularOfferingList";
import { ExtraOfferingDetailTabBar } from "./components/ExtraOfferingDetailTabBar";
import { StudentExtraOfferingDetailSection } from "./StudentExtraOfferingDetailSection";
import { StudentExtraOfferingCompetenciesSection } from "./StudentExtraOfferingCompetenciesSection";
import { StudentExtraOfferingSessionSection } from "./StudentExtraOfferingSessionSection";
import { useI18n } from "@/i18n/useI18n";

export function StudentExtraCurricularOfferingDetailPage() {
  const params = useParams<{ id: string }>();
  const offeringId = Number(params.id);
  const router = useRouter();
  const [tab, setTab] = useState<"detail" | "session" | "competencies">("detail");
  const t = useI18n("extraCurricular.studentOfferingDetail.page");

  const { state } = useExtraCurricularDetail(offeringId);
  const { data, loading, error } = state;
  if (loading) return <div className={styles.page}>{t("loading")}</div>;
  if (error) return <div className={styles.page}>{t("loadError")}</div>;
  if (!data) return <div className={styles.page}>{t("empty")}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.title}>{t("title")}</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          {t("backButton")} →
        </button>
      </div>

      <div className={styles.tabRow}>
        <ExtraOfferingDetailTabBar value={tab} onChange={setTab} />
      </div>

      <div className={styles.body}>
        {tab === "detail" && <StudentExtraOfferingDetailSection offeringId={offeringId} data={data} />}
        {tab === "session" && <StudentExtraOfferingSessionSection offeringId={offeringId} />}
        {tab === "competencies" && (
          <StudentExtraOfferingCompetenciesSection offeringId={offeringId} data={data} />
        )}
      </div>
    </div>
  );
}
