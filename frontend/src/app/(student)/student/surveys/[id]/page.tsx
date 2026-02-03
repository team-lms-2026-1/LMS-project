
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSurveyDetail, submitSurvey } from "@/features/surveys/service/student";
import { SurveyDetailResponse } from "@/features/surveys/types";
import styles from "../survey.module.css";
import toast from "react-hot-toast";

export default function SurveyDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [survey, setSurvey] = useState<SurveyDetailResponse | null>(null);
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSurveyDetail(params.id)
            .then((data) => setSurvey(data))
            .catch((err) => {
                console.error(err);
                toast.error("설문 정보를 불러오지 못했습니다.");
            })
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleResponseChange = (questionId: number, value: number) => {
        setResponses((prev) => ({
            ...prev,
            [String(questionId)]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!survey) return;

        // Validation
        const unanswered = survey.questions.find(
            (q) => q.isRequired && !responses[String(q.questionId)]
        );

        if (unanswered) {
            toast.error("모든 필수 항목에 응답해주세요.");
            return;
        }

        if (!confirm("제출하시겠습니까? 제출 후에는 수정할 수 없습니다.")) return;

        setSubmitting(true);
        try {
            await submitSurvey({
                surveyId: survey.surveyId,
                responses: responses,
            });
            toast.success("설문이 제출되었습니다.");
            router.push("/student/surveys");
        } catch (err) {
            console.error(err);
            toast.error("제출 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.container}>Loading...</div>;
    if (!survey) return <div className={styles.container}>설문을 찾을 수 없습니다.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.detailHeader}>
                <h1 className={styles.title}>{survey.title}</h1>
                {survey.description && <p className={styles.surveyDescription}>{survey.description}</p>}
                <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
                    기간: {new Date(survey.startAt).toLocaleString()} ~ {new Date(survey.endAt).toLocaleString()}
                </div>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {survey.questions
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((q) => (
                        <div key={q.questionId} className={styles.questionCard}>
                            <div className={styles.questionText}>
                                <span style={{ color: "red", marginRight: "4px" }}>{q.isRequired ? "*" : ""}</span>
                                {q.questionText}
                            </div>

                            <div className={styles.options}>
                                <span className={styles.optionLabel}>{q.minLabel || "비동의"}</span>
                                <div className={styles.radioGroup}>
                                    {[1, 2, 3, 4, 5].filter(v => v >= q.minVal && v <= q.maxVal).map((val) => (
                                        <label key={val} className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name={`q-${q.questionId}`}
                                                value={val}
                                                checked={responses[String(q.questionId)] === val}
                                                onChange={() => handleResponseChange(q.questionId, val)}
                                            />
                                            <span style={{ marginTop: "4px" }}>{val}</span>
                                        </label>
                                    ))}
                                </div>
                                <span className={styles.optionLabel}>{q.maxLabel || "동의"}</span>
                            </div>
                        </div>
                    ))}

                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <button type="submit" className={styles.submitBtn} disabled={submitting}>
                        {submitting ? "제출 중..." : "설문 제출하기"}
                    </button>
                </div>
            </form>
        </div>
    );
}
