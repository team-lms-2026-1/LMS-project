"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/useI18n";
import { useLocale } from "@/hooks/useLocale";
import {
  getLocalizedCompetencyDescription,
  getLocalizedCompetencyName,
} from "@/features/competencies/utils/competencyLocale";
import styles from "./OfferingCompetenciesSection.module.css";
import { OfferingCompetencyRadarChart } from "./components/OfferingCompetencyRadarChart";
import { useOfferingCompetencyMapping } from "../../hooks/useCurricularOfferingList";
import type { CurricularOfferingDetailDto } from "@/features/curricular-offering/api/types";

type Props = {
  offeringId?: number;
  data: CurricularOfferingDetailDto;
};

export function OfferingCompetenciesSection({ offeringId, data }: Props) {
  const t = useI18n("curricular.adminOfferingDetail.competencies");
  const { locale } = useLocale();
  const { state } = useOfferingCompetencyMapping(offeringId);
  const { data: mappingData, loading, error } = state;

  const mainCompetencies = useMemo(() => {
    if (!mappingData?.length) return [];

    return [...mappingData]
      .filter((item) => item.weight != null)
      .sort((a, b) => {
        const diff = (b.weight ?? -1) - (a.weight ?? -1);
        if (diff !== 0) return diff;
        return String(a.code).localeCompare(String(b.code));
      })
      .slice(0, 2);
  }, [mappingData]);

  const getCompetencyName = (code: string, fallback: string) =>
    getLocalizedCompetencyName(code, locale, fallback);

  const getCompetencyDescription = (code: string, fallback: string) =>
    getLocalizedCompetencyDescription(code, locale, fallback);

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <Header title={`${data.curricularName} (${data.offeringCode} / ${data.semesterName})`} />
        <div className={styles.body}>
          <span>
            {t("labels.professor")} : {data.professorName}
          </span>
          <span>
            {t("labels.mainCompetencies")} :{" "}
            {mainCompetencies.length
              ? mainCompetencies.map((item) => getCompetencyName(item.code, item.name)).join(", ")
              : "-"}
          </span>
        </div>
      </div>

      <div className={styles.mainRow}>
        <div className={`${styles.section} ${styles.leftCol}`}>
          <Header title={t("titles.mapping")} />
          <div className={styles.body}>
            {loading ? <div>{t("messages.loading")}</div> : null}
            {error ? <div>{t("messages.loadError")}</div> : null}

            {!loading && !error && mappingData?.length ? (
              <>
                <ul className={styles.description}>
                  {mappingData.map((item) => (
                    <li key={item.competencyId}>
                      <strong>{getCompetencyName(item.code, item.name)}</strong> :{" "}
                      {getCompetencyDescription(item.code, item.description)}
                    </li>
                  ))}
                </ul>

                <div className={styles.mappingGrid}>
                  {mappingData.map((item) => (
                    <div key={item.competencyId} className={styles.mappingCard}>
                      <div className={styles.mappingTop}>
                        <div className={styles.mappingName}>
                          {getCompetencyName(item.code, item.name)}
                        </div>
                      </div>

                      <div className={styles.scoreRow}>
                        {[1, 2, 3, 4, 5, 6].map((score) => (
                          <button
                            key={score}
                            type="button"
                            className={[
                              styles.scoreBtn,
                              item.weight === score ? styles.scoreBtnActive : "",
                              styles.scoreBtnReadOnly,
                            ].join(" ")}
                            disabled
                            aria-disabled="true"
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className={`${styles.section} ${styles.rightCol}`}>
          <Header title={t("titles.radar")} />
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
