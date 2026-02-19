"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { useCurricularDetail } from "../../hooks/useCurricularOfferingList";
import { ProfessorOfferingCompetenciesSection } from "./ProfessorOfferingCompetenciesSection";
import { ProfessorOfferingDetailSection } from "./ProfessorOfferingDetailSection";
import { ProfessorOfferingStudentsSection } from "./ProfessorOfferingStudentsSection";
import { ProfessorOfferingDetailTabBar } from "./components/ProfessorOfferingDetailTabBar";
import styles from "./ProfessorCurricularOfferingDetailPage.module.css";

export function ProfessorCurricularOfferingDetailPageClient() {
  const params = useParams<{ id: string }>();
  const offeringId = Number(params.id);
  const router = useRouter();

  const [tab, setTab] = useState<"detail" | "students" | "competencies">("detail");

  const { state } = useCurricularDetail(offeringId);
  const { data, loading, error } = state;

  if (loading) return <div className={styles.page}>불러오는 중...</div>;
  if (error) return <div className={styles.page}>오류가 발생했습니다.</div>;
  if (!data) return <div className={styles.page}>데이터가 없습니다.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.title}>내 강의 상세</div>
        <button className={styles.backBtn} type="button" onClick={() => router.back()}>
          목록
        </button>
      </div>

      <div className={styles.tabRow}>
        <ProfessorOfferingDetailTabBar value={tab} onChange={setTab} />
      </div>

      <div className={styles.body}>
        {tab === "detail" && <ProfessorOfferingDetailSection data={data} />}
        {tab === "students" && <ProfessorOfferingStudentsSection offeringId={offeringId} />}
        {tab === "competencies" && (
          <ProfessorOfferingCompetenciesSection offeringId={offeringId} data={data} />
        )}
      </div>
    </div>
  );
}
