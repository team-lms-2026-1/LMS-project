"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./CurricularOfferingDetailPage.module.css";

import { OfferingDetailTabBar } from "./components/OfferingDetailTabBar";
import { OfferingDetailSection } from "./OfferingDetailSection";
import { OfferingStudentsSection } from "./OfferingStudentsSection";
import { OfferingCompetenciesSection } from "./OfferingCompetenciesSection";

export function CurricularOfferingDetailPageClient() {
  const params = useParams<{ id: string }>();
  const offeringId = Number(params.id);
  const router = useRouter();
  const [tab, setTab] = useState<"detail" | "students" | "competencies">("detail");

  return (
    <div className={styles.page}>
      {/* 상단 바: 왼쪽 제목 / 오른쪽 목록 화살표 */}
      <div className={styles.topBar}>
        <div className={styles.title}>교과운영 운영관리</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          목록 →
        </button>
      </div>

      {/* 제목 아래 살짝 띄우고 탭 */}
      <div className={styles.tabRow}>
        <OfferingDetailTabBar value={tab} onChange={setTab} />
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        {tab === "detail" && <OfferingDetailSection offeringId={offeringId} />}
        {tab === "students" && <OfferingStudentsSection offeringId={offeringId} />}
        {tab === "competencies" && <OfferingCompetenciesSection offeringId={offeringId} />}
      </div>
    </div>
  );
}
