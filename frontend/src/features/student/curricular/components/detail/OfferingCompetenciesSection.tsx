"use client";

import React, { useEffect, useMemo, useState } from "react";

import styles from "./OfferingCompetenciesSection.module.css";
import { OfferingCompetencyRadarChart } from "./components/OfferingCompetencyRadarChart";

import { useOfferingCompetencyMapping } from "../../hooks/useCurricularOfferingList";
import type { CurricularOfferingDetailDto } from "@/features/curricular-offering/api/types";

type Props = {
  offeringId?: number;
  data: CurricularOfferingDetailDto;
};

export function OfferingCompetenciesSection({ offeringId, data }: Props) {
  const { state } = useOfferingCompetencyMapping(offeringId);
  const { data: mappingData, loading, error } = state;

  // (competencyId -> weight) : 표시용 local state
  const [weights, setWeights] = useState<Record<number, number | null>>({});

  // ✅ 서버 데이터로 초기값 세팅
  useEffect(() => {
    if (!mappingData?.length) return;

    const init: Record<number, number | null> = {};
    for (const item of mappingData) {
      init[item.competencyId] = item.weight ?? null;
    }
    setWeights(init);
  }, [mappingData]);

  // ✅ 주역량(상위 2개) 계산
  const mainCompetencies = useMemo(() => {
    if (!mappingData?.length) return [];

    return [...mappingData]
      .filter((x) => x.weight != null)
      .sort((a, b) => {
        const diff = (b.weight ?? -1) - (a.weight ?? -1);
        if (diff !== 0) return diff;
        return String(a.code).localeCompare(String(b.code));
      })
      .slice(0, 2);
  }, [mappingData]);

  return (
    <div className={styles.wrap}>
      {/* 상단 */}
      <div className={styles.section}>
        <Header title={`${data.curricularName} (${data.offeringCode} / ${data.semesterName})`} />
        <div className={styles.body}>
          <span>담당교수 : {data.professorName}</span>
          <span>
            주역량 :{" "}
            {mainCompetencies.length ? mainCompetencies.map((c) => c.name).join(", ") : "-"}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className={styles.mainRow}>
        {/* 왼쪽 */}
        <div className={`${styles.section} ${styles.leftCol}`}>
          <Header title="역량 맵핑" />
          <div className={styles.body}>
            {loading ? <div>불러오는 중...</div> : null}
            {error ? <div>조회 실패</div> : null}

            {!loading && !error && mappingData?.length ? (
              <>
                <ul className={styles.description}>
                  {mappingData.map((item) => (
                    <li key={item.competencyId}>
                      <strong>{item.name}</strong> : {item.description}
                    </li>
                  ))}
                </ul>

                <div className={styles.mappingGrid}>
                  {mappingData.map((item) => {
                    const selected = weights[item.competencyId];

                    return (
                      <div key={item.competencyId} className={styles.mappingCard}>
                        <div className={styles.mappingTop}>
                          <div className={styles.mappingName}>{item.name}</div>
                        </div>

                        {/* ✅ 학생 페이지: 표시만 (클릭/수정 불가) */}
                        <div className={styles.scoreRow}>
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <button
                              key={n}
                              type="button"
                              className={[
                                styles.scoreBtn,
                                selected === n ? styles.scoreBtnActive : "",
                                styles.scoreBtnReadOnly,
                              ].join(" ")}
                              disabled
                              aria-disabled="true"
                              title="학생 페이지에서는 수정할 수 없습니다."
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* 오른쪽 */}
        <div className={`${styles.section} ${styles.rightCol}`}>
          <Header title="역량맵핑 레이더차트" />
          <div className={styles.body}>
            {!loading && !error && mappingData?.length ? (
              <OfferingCompetencyRadarChart items={mappingData} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>{title}</div>
    </div>
  );
}
