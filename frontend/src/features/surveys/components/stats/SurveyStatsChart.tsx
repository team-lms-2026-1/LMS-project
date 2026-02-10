"use client";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useMemo, useState } from "react";
import styles from "./SurveyStatsChart.module.css";
import { SurveyStatsDto } from "../../api/types";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const COLORS = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#C9CBCF',
    '#FFCD56',
    '#4D5360',
];

interface Props {
    stats: SurveyStatsDto;
}

type ViewMode = "DEPT" | "GRADE";

export function SurveyStatsChart({ stats }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("DEPT");

    const data: ChartData<"doughnut"> = useMemo(() => {
        const source = viewMode === "DEPT" ? stats.responseByDept : stats.responseByGrade;
        // source might be null or undefined if no data
        const keys = source ? Object.keys(source) : [];
        const values = source ? Object.values(source) : [];

        if (keys.length === 0) {
            return {
                labels: ["데이터 없음"],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ["#E5E7EB"],
                    },
                ],
            };
        }

        return {
            labels: keys,
            datasets: [
                {
                    data: values,
                    backgroundColor: COLORS.slice(0, keys.length),
                    borderColor: "#ffffff",
                    borderWidth: 2,
                },
            ],
        };
    }, [stats, viewMode]);

    return (
        <div className={styles.chartContainer}>
            <div className={styles.controls}>
                <button
                    className={`${styles.tabBtn} ${viewMode === "DEPT" ? styles.tabBtnActive : ""}`}
                    onClick={() => setViewMode("DEPT")}
                >
                    학과별 통계
                </button>
                <button
                    className={`${styles.tabBtn} ${viewMode === "GRADE" ? styles.tabBtnActive : ""}`}
                    onClick={() => setViewMode("GRADE")}
                >
                    학년별 통계
                </button>
            </div>

            <div className={styles.chartWrapper}>
                <Doughnut
                    data={data}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                            },
                            title: {
                                display: true,
                                text: viewMode === "DEPT" ? "학과별 참여 비율" : "학년별 참여 비율"
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}
