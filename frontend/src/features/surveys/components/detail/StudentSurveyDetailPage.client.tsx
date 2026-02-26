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
import { useI18n } from "@/i18n/useI18n";

interface Props {
    id: string;
}

export default function StudentSurveyDetailPageClient({ id }: Props) {
    const tDetail = useI18n("survey.student.detail");
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
            toast.error(e.message ?? tDetail("messages.loadFailed"));
            if (e.body?.code === "SURVEY_NOT_OPEN" || e.body?.code === "SURVEY_ALREADY_SUBMITTED") {
                router.push("/student/surveys");
            }
        } finally {
            setLoading(false);
        }
    }, [id, router, tDetail]);

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
            toast.error(tDetail("messages.requiredMissing"));
            return;
        }

        setSubmitting(true);
        try {
            await submitSurvey({
                surveyId: survey.surveyId,
                responses
            });
            toast.success(tDetail("messages.submitSuccess"));
            router.push("/student/surveys");
        } catch (e: any) {
            console.error(e);
            toast.error(e.message ?? tDetail("messages.submitFailed"));
        } finally {
            setSubmitting(false);
            setIsConfirmOpen(false);
        }
    };

    if (loading) return <div className={styles.loading}>{tDetail("loading")}</div>;

    if (!survey) return <div className={styles.errorContainer}>{tDetail("errorNotFound")}</div>;

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{survey.title}</h1>
                    {survey.description && <p className={styles.description}>{survey.description}</p>}
                    <div className={styles.meta}>
                        {tDetail("period", {
                            start: new Date(survey.startAt).toLocaleString(),
                            end: new Date(survey.endAt).toLocaleString(),
                        })}
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
                        {tDetail("submitButton")}
                    </Button>
                </div>
            </div>

            <ConfirmModal
                open={isConfirmOpen}
                title={tDetail("confirm.title")}
                message={tDetail("confirm.message")}
                onConfirm={handleSubmit}
                onCancel={() => setIsConfirmOpen(false)}
                loading={submitting}
            />
        </div>
    );
}
