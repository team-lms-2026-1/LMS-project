"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/features/student/curricular/components/detail/OfferingCompetenciesSection.module.css";
import { OfferingCompetencyRadarChart } from "@/features/student/curricular/components/detail/components/OfferingCompetencyRadarChart";

import type { ExtraCurricularOfferingDetailDto } from "../../api/types";
import { useStudentExtraOfferingCompetencyMapping } from "../../hooks/useExtraCurricularOfferingList";

type Props = {
  offeringId?: number;
  data: ExtraCurricularOfferingDetailDto;
};

export function StudentExtraOfferingCompetenciesSection({ offeringId, data }: Props) {
  const { state } = useStudentExtraOfferingCompetencyMapping(offeringId);
  const { data: mappingData, loading, error } = state;

  const [weights, setWeights] = useState<Record<number, number | null>>({});

  useEffect(() => {
    if (!mappingData?.length) return;

    const init: Record<number, number | null> = {};
    for (const item of mappingData) {
      init[item.competencyId] = item.weight ?? null;
    }
    setWeights(init);
  }, [mappingData]);

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
      <div className={styles.section}>
        <Header title={`${data.extraCurricularName} (${data.extraOfferingCode} / ${data.semesterDisplayName})`} />
        <div className={styles.body}>
          <span>주관기관 : {data.hostContactName}</span>
          <span>
            주역량:{" "}
            {mainCompetencies.length ? mainCompetencies.map((c) => c.name).join(", ") : "-"}
          </span>
        </div>
      </div>

      <div className={styles.mainRow}>
        <div className={`${styles.section} ${styles.leftCol}`}>
          <Header title="역량 매핑" />
          <div className={styles.body}>
            {loading ? <div>불러오는 중..</div> : null}
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

        <div className={`${styles.section} ${styles.rightCol}`}>
          <Header title="역량매핑 레이더차트" />
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
