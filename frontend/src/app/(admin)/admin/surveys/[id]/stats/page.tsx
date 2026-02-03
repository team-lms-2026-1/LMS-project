"use client";

import { useEffect, useState } from "react";
import { getSurveyStats } from "@/features/surveys/service";
import { SurveyStatsResponse } from "@/features/surveys/types";
import { StatCard } from "@/features/surveys/components/StatCard";
import { SurveyStatsChart } from "@/features/surveys/components/SurveyStatsChart";
import styles from "./page.module.css";

export default function SurveyStatsPage({ params }: { params: { id: string } }) {
    const [stats, setStats] = useState<SurveyStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSurveyStats(Number(params.id))
            .then(setStats)
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return <div>Loading stats...</div>;
    if (!stats) return <div>통계 정보를 불러올 수 없습니다.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{stats.title}</h1>
                <div className={styles.meta}>
                    <span>작성일: {new Date(stats.createdAt).toLocaleDateString()}</span>
                    <span className={styles.divider}>|</span>
                    <span>기간: {new Date(stats.startAt).toLocaleString()} ~ {new Date(stats.endAt).toLocaleString()}</span>
                </div>
            </header>

            <div className={styles.grid}>
                <StatCard label="총 대상자" value={`${stats.totalTargets}명`} />
                <StatCard label="응답 완료" value={`${stats.submittedCount}명`} />
                <StatCard label="응답률" value={`${stats.responseRate}%`} highlight />
            </div>

            <SurveyStatsChart stats={stats} />
        </div>
    );
}
