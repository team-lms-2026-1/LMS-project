
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAvailableSurveys } from "@/features/surveys/service/student";
import { SurveyListResponse, SurveyStatus, SurveyTypeLabel } from "@/features/surveys/types";
import styles from "./survey.module.css";

export default function StudentSurveyListPage() {
    const [surveys, setSurveys] = useState<SurveyListResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailableSurveys()
            .then((data) => setSurveys(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>진행 중인 설문</h1>

            {surveys.length === 0 ? (
                <p>참여 가능한 설문이 없습니다.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>종류</th>
                            <th>제목</th>
                            <th>기간</th>

                            <th>참여</th>
                        </tr>
                    </thead>
                    <tbody>
                        {surveys.map((survey) => (
                            <tr key={survey.surveyId}>
                                <td>{SurveyTypeLabel[survey.type]}</td>
                                <td>{survey.title}</td>
                                <td>
                                    {new Date(survey.startAt).toLocaleDateString()} ~{" "}
                                    {new Date(survey.endAt).toLocaleDateString()}
                                </td>

                                <td>
                                    {/* Assuming only active surveys are returned here, but we can check status */}
                                    <Link href={`/student/surveys/${survey.surveyId}`} className={styles.link}>
                                        참여하기 &rarr;
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
