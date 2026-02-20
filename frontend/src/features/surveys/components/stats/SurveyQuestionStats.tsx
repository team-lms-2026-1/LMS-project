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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    questions: QuestionStatsDto[];
}

export function SurveyQuestionStats({ questions }: Props) {
    if (!questions || questions.length === 0) {
        return <div className={styles.noData}>문항 데이터를 찾을 수 없습니다.</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>문항별 응답 상세</h2>
            <div className={styles.grid}>
                {questions.map((q) => (
                    <div key={q.questionId} className={styles.questionCard}>
                        <h3 className={styles.questionTitle}>
                            <span className={styles.qNum}>Q.</span> {q.title}
                            <span className={styles.qType}>{getTypeLabel(q.type)}</span>
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
                                    <div className={styles.noEssay}>응답이 없습니다.</div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.chartWrapper}>
                                <BarChart data={q.answerCounts} />
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

function BarChart({ data }: { data: Record<string, number> }) {
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
                label: "응답 수",
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

function getTypeLabel(type: string) {
    switch (type) {
        case "RATING": return "척도형";
        case "SINGLE_CHOICE": return "객관식";
        case "MULTIPLE_CHOICE": return "다중선택";
        case "ESSAY": return "주관식";
        default: return type;
    }
}
