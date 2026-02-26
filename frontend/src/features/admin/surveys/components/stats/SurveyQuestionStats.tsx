"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { QuestionStatsDto } from "../../api/types";
import styles from "./SurveyQuestionStats.module.css";
import { useI18n } from "@/i18n/useI18n";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    questions: QuestionStatsDto[];
}

export function SurveyQuestionStats({ questions }: Props) {
    const t = useI18n("survey.admin.stats.questions");
    const tQuestionTypes = useI18n("survey.common.questionTypes.short");

    const typeLabel = (type: string) => {
        if (type === "RATING") return tQuestionTypes("RATING");
        if (type === "SINGLE_CHOICE") return tQuestionTypes("SINGLE_CHOICE");
        if (type === "MULTIPLE_CHOICE") return tQuestionTypes("MULTIPLE_CHOICE");
        if (type === "ESSAY") return tQuestionTypes("ESSAY");
        return type;
    };

    if (!questions || questions.length === 0) {
        return <div className={styles.noData}>{t("noData")}</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t("sectionTitle")}</h2>
            <div className={styles.grid}>
                {questions.map((q) => (
                    <div key={q.questionId} className={styles.questionCard}>
                        <h3 className={styles.questionTitle}>
                            <span className={styles.qNum}>Q.</span> {q.title}
                            <span className={styles.qType}>{typeLabel(q.type)}</span>
                        </h3>

                        {q.type === "ESSAY" ? (
                            <div className={styles.essayList}>
                                {q.essayAnswers.length > 0 ? (
                                    q.essayAnswers.map((ans: string, i: number) => (
                                        <div key={i} className={styles.essayItem}>
                                            {ans}
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.noEssay}>{t("noEssay")}</div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.chartWrapper}>
                                <BarChart data={q.answerCounts} label={t("responseCount")} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const COLORS = [
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#bfdbfe', // blue-200
    '#dbeafe', // blue-100
    '#1d4ed8', // blue-700
    '#1e40af', // blue-800
];

function BarChart({ data, label }: { data: Record<string, number>; label: string }) {
    const labels = Object.keys(data).sort((a, b) => {
        if (!isNaN(Number(a)) && !isNaN(Number(b))) {
            return Number(a) - Number(b);
        }
        return a.localeCompare(b);
    });
    const values = labels.map((l) => data[l]);

    const chartData: ChartData<"bar"> = {
        labels,
        datasets: [
            {
                label,
                data: values,
                backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 6,
                barThickness: 20,
            },
        ],
    };

    return (
        <Bar
            data={chartData}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        cornerRadius: 8,
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: false,
                        },
                        ticks: {
                            stepSize: 1,
                            color: '#64748b',
                        },
                    },
                    y: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: '#475569',
                            font: { weight: 600 }
                        }
                    }
                },
            }}
        />
    );
}
