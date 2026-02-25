"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./CurricularOfferingDetailPage.module.css";
import { OfferingDetailTabBar } from "./components/OfferingDetailTabBar";
import { OfferingDetailSection } from "./OfferingDetailSection";
import { OfferingCompetenciesSection } from "./OfferingCompetenciesSection";
import { useCurricularDetail } from "../../hooks/useCurricularOfferingList";

export function CurricularOfferingDetailPageClient() {
  const params = useParams<{ id: string }>();
  const offeringId = Number(params.id);
  const router = useRouter();
  const t = useI18n("curricular.adminOfferingDetail.page");
  const [tab, setTab] = useState<"detail" | "competencies">("detail");

  const { state } = useCurricularDetail(offeringId);
  const { data, loading, error } = state;

  if (loading) return <div className={styles.page}>{t("loading")}</div>;
  if (error) return <div className={styles.page}>{t("loadError")}</div>;
  if (!data) return <div className={styles.page}>{t("empty")}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.title}>{t("title")}</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          {t("backButton")} {"<-"}
        </button>
      </div>

      <div className={styles.tabRow}>
        <OfferingDetailTabBar value={tab} onChange={setTab} />
      </div>

      <div className={styles.body}>
        {tab === "detail" && <OfferingDetailSection offeringId={offeringId} data={data} />}
        {tab === "competencies" && <OfferingCompetenciesSection offeringId={offeringId} data={data} />}
      </div>
    </div>
  );
}
