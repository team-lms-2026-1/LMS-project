"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchSurveyDetail, submitSurvey } from "@/features/surveys/service/student";
import { SurveyDetailResponse } from "@/features/surveys/types";
import styles from "../survey.module.css";
import toast from "react-hot-toast";


import { StudentSurveyQuestionCard } from "@/features/surveys/components/StudentSurveyQuestionCard";
import { Button } from "@/components/button/Button";


import { ConfirmDialog } from "@/components/modal/ConfirmDialog";

export default function SurveyDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [survey, setSurvey] = useState<SurveyDetailResponse | null>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const errorToastShown = useRef(false);

    useEffect(() => {
        fetchSurveyDetail(params.id)
            .then((data) => {
                setSurvey(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Fetch Error:", err);
                const code = err?.body?.code || err?.body?.error?.code || (typeof err?.body === "string" ? err.body : "");
                const msg = err?.message || "";

                if (code === "SURVEY_NOT_OPEN" || msg.includes("SURVEY_NOT_OPEN") || JSON.stringify(err).includes("SURVEY_NOT_OPEN")) {
                    setError("SURVEY_NOT_OPEN");
                    if (!errorToastShown.current) {
                        toast.error("설문 기간이 아닙니다.");
                        errorToastShown.current = true;
                    }
                } else {
                    setError("UNKNOWN");
                    if (!errorToastShown.current) {
                        toast.error("설문 정보를 불러오지 못했습니다.");
                        errorToastShown.current = true;
                    }
                }
            })
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleResponseChange = (questionId: number, value: any) => {
        setResponses((prev) => ({
            ...prev,
            [String(questionId)]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!survey) return;

        // Validation
        const unanswered = survey.questions.find((q) => {
            if (!q.isRequired) return false;
            const val = responses[String(q.questionId)];
            if (val === undefined || val === null || val === "") return true;
            if (Array.isArray(val) && val.length === 0) return true;
            return false;
        });

        if (unanswered) {
            toast.error("모든 필수 항목에 응답해주세요.");
            return;
        }

        setConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (!survey) return;

        setSubmitting(true);
        try {
            await submitSurvey({
                surveyId: survey.surveyId,
                responses: responses,
            });
            toast.success("설문이 제출되었습니다.");
            router.push("/student/surveys");
        } catch (err: any) {
            console.error(err);
            const code = err?.body?.code || err?.body?.error?.code;
            if (code === "SURVEY_NOT_OPEN") {
                toast.error("설문 기간이 아닙니다.");
            } else {
                toast.error("제출 중 오류가 발생했습니다.");
            }
        } finally {
            setSubmitting(false);
            setConfirmOpen(false);
        }
    };

    if (loading) return <div className={styles.container}>Loading...</div>;
    if (error === "SURVEY_NOT_OPEN") return <div className={styles.container}>설문 기간이 아닙니다.</div>;
    if (!survey) return <div className={styles.container}>설문을 찾을 수 없습니다.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.detailHeader}>
                <h1 className={styles.title}>{survey.title}</h1>
                <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
                    기간: {new Date(survey.startAt).toLocaleString()} ~ {new Date(survey.endAt).toLocaleString()}
                </div>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {survey.questions
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((q) => (
                        <StudentSurveyQuestionCard
                            key={q.questionId}
                            question={q}
                            response={responses[String(q.questionId)]}
                            onResponseChange={(val) => handleResponseChange(q.questionId, val)}
                        />
                    ))}

                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <Button type="submit" loading={submitting} disabled={submitting} style={{ padding: "0.8rem 3rem", fontSize: "1.1rem" }}>
                        설문 제출하기
                    </Button>
                </div>
            </form>

            <ConfirmDialog
                open={confirmOpen}
                title="설문 제출"
                description="제출하시겠습니까? 제출 후에는 수정할 수 없습니다."
                confirmText="제출"
                onConfirm={handleConfirmSubmit}
                onCancel={() => setConfirmOpen(false)}
                loading={submitting}
            />
        </div>
    );
}
