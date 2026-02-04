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
import { QuestionStats } from "../types";
import styles from "./SurveyQuestionStats.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    questions: QuestionStats[];
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
                                    q.essayAnswers.map((ans, i) => (
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
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#C9CBCF',
];

function BarChart({ data }: { data: Record<string, number> }) {
    const labels = Object.keys(data).sort((a, b) => {
        // Handle numeric keys (Rating)
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
                borderRadius: 4,
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
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                        },
                    },
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
