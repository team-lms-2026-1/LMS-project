"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import { useLocale } from "@/hooks/useLocale";
import {
  getLocalizedCompetencyDescription,
  getLocalizedCompetencyName,
} from "@/features/admin/competencies/utils/competencyLocale";
import { stripSemesterSuffix } from "@/features/admin/extra-curricular/offerings/utils/semesterDisplayName";
import styles from "./ExtraOfferingCompetenciesSection.module.css";
import { OfferingCompetencyRadarChart } from "./components/OfferingCompetencyRadarChart";

import type { ExtraCurricularOfferingDetailDto } from "../../api/types";
import { useStudentExtraOfferingCompetencyMapping } from "../../hooks/useExtraCurricularOfferingList";

type Props = {
  offeringId?: number;
  data: ExtraCurricularOfferingDetailDto;
};

export function StudentExtraOfferingCompetenciesSection({ offeringId, data }: Props) {
  const t = useI18n("extraCurricular.studentOfferingDetail.competencies");
  const { locale } = useLocale();
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

  const getCompetencyName = (code: string, fallback: string) =>
    getLocalizedCompetencyName(code, locale, fallback);

  const getCompetencyDescription = (code: string, fallback: string) =>
    getLocalizedCompetencyDescription(code, locale, fallback);
  const semesterDisplayName = stripSemesterSuffix(data.semesterDisplayName);

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <Header title={`${data.extraCurricularName} (${data.extraOfferingCode} / ${semesterDisplayName})`} />
        <div className={styles.body}>
          <span>{t("labels.hostOrgName")} : {data.hostContactName}</span>
          <span>
            {t("labels.mainCompetencies")} :{" "}
            {mainCompetencies.length
              ? mainCompetencies.map((c) => getCompetencyName(c.code, c.name)).join(", ")
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
                  {mappingData.map((item) => {
                    const selected = weights[item.competencyId];

                    return (
                      <div key={item.competencyId} className={styles.mappingCard}>
                        <div className={styles.mappingTop}>
                          <div className={styles.mappingName}>
                            {getCompetencyName(item.code, item.name)}
                          </div>
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
                              title={t("messages.readonly")}
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
