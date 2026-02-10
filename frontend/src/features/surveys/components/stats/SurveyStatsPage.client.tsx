"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSurveyStats } from "@/features/surveys/api/surveysApi";
import { SurveyStatsDto } from "@/features/surveys/api/types";
import { StatCard } from "./StatCard";
import { SurveyStatsChart } from "./SurveyStatsChart";
import { SurveyQuestionStats } from "./SurveyQuestionStats";
import styles from "./SurveyStatsPage.client.module.css";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";

interface Props {
    id: string;
}

export default function SurveyStatsPageClient({ id }: Props) {
    const router = useRouter();
    const [stats, setStats] = useState<SurveyStatsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            const res = await fetchSurveyStats(Number(id));
            setStats(res.data);
        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "통계 정보를 찾을 수 없습니다.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <div className={styles.loading}>통계 정보를 불러오는 중...</div>;
    if (errorMsg || !stats) return <div className={styles.error}>{errorMsg || "통계 정보를 찾을 수 없습니다."}</div>;

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.title}>{stats.title} 결과 분석</div>
                <button className={styles.backBtn} type="button" onClick={() => router.back()}>
                    목록으로 →
                </button>
            </div>

            <div className={styles.body}>
                <section className={styles.sectionCard}>
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>작성일:</span>
                            <span className={styles.metaValue}>{new Date(stats.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>진행 기간:</span>
                            <span className={styles.metaValue}>
                                {new Date(stats.startAt).toLocaleString()} ~ {new Date(stats.endAt).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className={styles.statGrid}>
                        <StatCard label="총 대상자" value={`${stats.totalTargets}명`} />
                        <StatCard label="응답 완료" value={`${stats.submittedCount}명`} />
                        <StatCard label="응답률" value={`${stats.responseRate}%`} highlight />
                    </div>

                    <div className={styles.chartSection}>
                        <SurveyStatsChart stats={stats} />
                    </div>
                </section>

                <div className={styles.detailSection}>
                    <SurveyQuestionStats questions={stats.questions} />
                </div>
            </div>
        </div>
    );
}
