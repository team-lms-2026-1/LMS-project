"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSurveyStats } from "@/features/admin/surveys/api/surveysApi";
import { SurveyStatsDto } from "@/features/admin/surveys/api/types";
import { StatCard } from "./StatCard";
import { SurveyStatsChart } from "./SurveyStatsChart";
import { SurveyQuestionStats } from "./SurveyQuestionStats";
import { TargetListModal } from "./TargetListModal";
import styles from "./SurveyStatsPage.client.module.css";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";

interface Props {
    id: string;
}

export default function SurveyStatsPageClient({ id }: Props) {
    const t = useI18n("survey.admin.stats");
    const router = useRouter();
    const [stats, setStats] = useState<SurveyStatsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [modalStatus, setModalStatus] = useState<"ALL" | "SUBMITTED" | "PENDING" | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            const res = await fetchSurveyStats(Number(id));
            setStats(res.data);
        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || t("errorNotFound"));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <div className={styles.loading}>{t("loading")}</div>;
    if (errorMsg || !stats) return <div className={styles.error}>{errorMsg || t("errorNotFound")}</div>;

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.title}>{`${stats.title} ${t("titleSuffix")}`}</div>
                <button className={styles.backBtn} type="button" onClick={() => router.back()}>
                    {t("backToList")}
                </button>
            </div>

            <div className={styles.body}>
                <section className={styles.sectionCard}>
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>{t("meta.createdAt")}</span>
                            <span className={styles.metaValue}>{new Date(stats.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>{t("meta.period")}</span>
                            <span className={styles.metaValue}>
                                {new Date(stats.startAt).toLocaleString()} ~ {new Date(stats.endAt).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className={styles.statGrid}>
                        <StatCard
                            label={t("cards.totalTargets")}
                            value={stats.totalTargets}
                            actionLabel={t("participants.viewTargets")}
                            onAction={() => setModalStatus("ALL")}
                        />
                        <StatCard
                            label={t("cards.submitted")}
                            value={stats.submittedCount}
                            actionLabel={t("participants.viewSubmitters")}
                            onAction={() => setModalStatus("SUBMITTED")}
                        />
                        <StatCard
                            label={t("cards.responseRate")}
                            value={`${stats.responseRate}%`}
                            highlight
                            actionLabel={t("participants.viewPending")}
                            onAction={() => setModalStatus("PENDING")}
                        />
                    </div>

                    <div className={styles.chartSection}>
                        <SurveyStatsChart stats={stats} />
                    </div>
                </section>

                <div className={styles.detailSection}>
                    <SurveyQuestionStats questions={stats.questions} />
                </div>
            </div>

            {modalStatus && (
                <TargetListModal
                    surveyId={stats.surveyId}
                    status={modalStatus}
                    onClose={() => setModalStatus(null)}
                />
            )}
        </div>
    );
}
