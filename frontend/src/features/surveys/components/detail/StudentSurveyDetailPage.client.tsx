"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchSurveyDetail, submitSurvey } from "@/features/surveys/api/studentSurveysApi";
import { SurveyDetailDto } from "@/features/surveys/api/types";
import styles from "./StudentSurveyDetailPage.client.module.css";
import toast from "react-hot-toast";

import { StudentSurveyQuestionCard } from "./StudentSurveyQuestionCard";
import { ConfirmModal } from "@/components/modal";
import { Button } from "@/components/button";

interface Props {
    id: string;
}

export default function StudentSurveyDetailPageClient({ id }: Props) {
    const router = useRouter();
    const [survey, setSurvey] = useState<SurveyDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchSurveyDetail(Number(id));
            setSurvey(res.data);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message ?? "설문을 불러올 수 없습니다.");
            if (e.body?.code === "SURVEY_NOT_OPEN" || e.body?.code === "SURVEY_ALREADY_SUBMITTED") {
                router.push("/student/surveys");
            }
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        load();
    }, [load]);

    const handleResponseChange = (questionId: number, val: any) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: val
        }));
    };

    const handleSubmit = async () => {
        if (!survey) return;

        const missing = survey.questions.filter(q => q.isRequired && !responses[q.questionId]);
        if (missing.length > 0) {
            toast.error("필수 항목에 모두 응답해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            await submitSurvey({
                surveyId: survey.surveyId,
                responses
            });
            toast.success("제출되었습니다. 감사합니다!");
            router.push("/student/surveys");
        } catch (e: any) {
            console.error(e);
            toast.error(e.message ?? "제출에 실패했습니다.");
        } finally {
            setSubmitting(false);
            setIsConfirmOpen(false);
        }
    };

    if (loading) return <div className={styles.loading}>설문 정보를 불러오는 중...</div>;

    if (!survey) return <div className={styles.errorContainer}>설문 정보를 찾을 수 없습니다.</div>;

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{survey.title}</h1>
                    {survey.description && <p className={styles.description}>{survey.description}</p>}
                    <div className={styles.meta}>
                        기간: {new Date(survey.startAt).toLocaleString()} ~ {new Date(survey.endAt).toLocaleString()}
                    </div>
                </header>

                <div className={styles.questionList}>
                    {survey.questions.map((q) => (
                        <StudentSurveyQuestionCard
                            key={q.questionId}
                            question={q}
                            response={responses[q.questionId]}
                            onResponseChange={(val) => handleResponseChange(q.questionId, val)}
                        />
                    ))}
                </div>

                <div className={styles.footer}>
                    <Button
                        variant="primary"
                        className={styles.submitBtn}
                        onClick={() => setIsConfirmOpen(true)}
                    >
                        제출하기
                    </Button>
                </div>
            </div>

            <ConfirmModal
                open={isConfirmOpen}
                title="설문 제출"
                message="제출 후에는 수정할 수 없습니다. 정말 제출하시겠습니까?"
                onConfirm={handleSubmit}
                onCancel={() => setIsConfirmOpen(false)}
                loading={submitting}
            />
        </div>
    );
}
