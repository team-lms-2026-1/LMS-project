"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./ExtraCurricularOfferingDetailPage.module.css";
import { useExtraCurricularDetail } from "../../hooks/useExtraCurricularOfferingList";
import { ExtraOfferingDetailTabBar } from "./components/ExtraOfferingDetailTabBar";
import { ExtraOfferingStatusDropdown } from "./components/ExtraOfferingStatusDropdown";
import { ExtraOfferingDetailSection } from "./ExtraOfferingDetailSection";
import { ExtraOfferingCompetenciesSection } from "./ExtraOfferingCompetenciesSection";
import ExtraOfferingSessionSection from "./ExtraOfferingSessionSection";
import { ExtraOfferingStudentsSection } from "./ExtraOfferingStudentsSection";
import { useI18n } from "@/i18n/useI18n";

// import { OfferingDetailTabBar } from "./components/OfferingDetailTabBar";
// import { OfferingDetailSection } from "./OfferingDetailSection";
// import { OfferingStudentsSection } from "./OfferingStudentsSection";
// import { OfferingCompetenciesSection } from "./OfferingCompetenciesSection";
// import { useCurricularDetail } from "../../hooks/useCurricularOfferingList";
// import { OfferingStatusDropdown } from "./components/OfferingStatusDropdown";

export function ExtraCurricularOfferingDetailPage() {
  const params = useParams<{ id: string }>();
  const offeringId = Number(params.id);
  const router = useRouter();
  const [tab, setTab] = useState<"detail" | "students" | "session" | "competencies">("detail");
  const t = useI18n("extraCurricular.adminOfferingDetail.page");

  // detail 페이지의 섹션을 여기서 불러와버림
  const { state, actions } = useExtraCurricularDetail(offeringId);
  const { data, loading, error } = state;
  if (loading) return <div className={styles.page}>{t("loading")}</div>;
  if (error) return <div className={styles.page}>{t("loadError")}</div>;
  if (!data) return <div className={styles.page}>{t("empty")}</div>;

  return (
    <div className={styles.page}>
      {/* 상단 바: 왼쪽 제목 / 오른쪽 목록 화살표 */}
      <div className={styles.topBar}>
        <div className={styles.title}>{t("title")}</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          {t("backButton")} →
        </button>
      </div>

      {/* 제목 아래 살짝 띄우고 탭 */}
      <div className={styles.tabRow}>
        {/* 왼쪽 */}
        <ExtraOfferingDetailTabBar value={tab} onChange={setTab} />
        {/* 오른쪽 */}
        <ExtraOfferingStatusDropdown offeringId={offeringId} status={data.status} onChanged = {() => actions.reload?.()} />
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        {tab === "detail" && <ExtraOfferingDetailSection offeringId={offeringId} data={data} onReload={() => actions.reload?.()}/>}
        {tab === "session" && <ExtraOfferingSessionSection offeringId={offeringId} offeringStatus={data.status} />}
        {tab === "students" && <ExtraOfferingStudentsSection offeringId={offeringId} />}
        {tab === "competencies" && <ExtraOfferingCompetenciesSection offeringId={offeringId} data={data} />}
      </div>
    </div>
  );
}
