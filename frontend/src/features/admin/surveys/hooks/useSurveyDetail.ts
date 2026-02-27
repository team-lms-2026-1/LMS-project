"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSurvey, fetchSurveyDetail, patchSurvey, fetchSurveyTypes } from "../api/surveysApi";
import {
    QuestionResponseDto,
    SurveyCreateRequest,
    SurveyPatchRequest,
    SurveyType,
    SurveyTypeResponse,
    TargetFilterDto as FilterDto
} from "../api/types";
import { useI18n } from "@/i18n/useI18n";

export function useSurveyDetail(idStr: string | undefined) {
    const t = useI18n("survey.hooks.detail");
    const router = useRouter();
    const isNew = idStr === "new";

    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState<QuestionResponseDto[]>([]);
    const [dates, setDates] = useState<{ startAt: string; endAt: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const [targetType, setTargetType] = useState<"ALL" | "DEPT" | "GRADE" | "DEPT_GRADE">("ALL");
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
    const [surveyType, setSurveyType] = useState<string>("ETC");
    const [surveyTypes, setSurveyTypes] = useState<SurveyTypeResponse[]>([]);

    const createNewQuestion = useCallback((order: number): QuestionResponseDto => ({
        questionId: -Date.now() - Math.random(),
        questionText: "",
        sortOrder: order,
        minVal: 1,
        maxVal: 5,
        minLabel: t("defaults.minLabel"),
        maxLabel: t("defaults.maxLabel"),
        isRequired: true,
        questionType: "RATING",
        options: []
    }), [t]);

    const load = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchSurveyDetail(id);
            const data = res.data;
            setTitle(data.title);
            setSurveyType(data.type);
            setQuestions(data.questions || []);

            const fmt = (s: string) => s.replace(" ", "T");
            setDates({ startAt: fmt(data.startAt), endAt: fmt(data.endAt) });

            if (data.targetFilter) {
                setTargetType(data.targetFilter.genType || "ALL");
                setSelectedDeptIds(data.targetFilter.deptIds || []);
                setSelectedGrades(data.targetFilter.gradeLevels || []);
            }
        } catch (e) {
            console.error(e);
            toast.error(t("messages.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (!isNew && idStr) {
            load(Number(idStr));
        } else {
            setTitle("");
            setQuestions([createNewQuestion(1)]);

            const n = new Date();
            const next = new Date();
            next.setDate(n.getDate() + 7);

            const fmt = (d: Date) => {
                const pad = (num: number) => String(num).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };

            setDates({ startAt: fmt(n), endAt: fmt(next) });
            setTargetType("ALL");
            setSurveyType("ETC");
        }

        fetchSurveyTypes().then(res => {
            if (res.data) setSurveyTypes(res.data);
        }).catch(console.error);
    }, [idStr, isNew, createNewQuestion, load]);

    const addQuestion = useCallback(() => {
        setQuestions((prev) => [...prev, createNewQuestion(prev.length + 1)]);
    }, [createNewQuestion]);

    const removeQuestion = useCallback((index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const updateQuestion = useCallback((index: number, updates: Partial<QuestionResponseDto>) => {
        setQuestions((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    }, []);

    const submit = useCallback(async () => {
        if (!title.trim()) {
            toast.error(t("validation.titleRequired"));
            return;
        }

        if (questions.length === 0) {
            toast.error(t("validation.questionRequired"));
            return;
        }

        const emptyQuestionIndex = questions.findIndex(q => !q.questionText.trim());
        if (emptyQuestionIndex !== -1) {
            toast.error(t("validation.questionTextRequired", { index: emptyQuestionIndex + 1 }));
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "SINGLE_CHOICE") {
                if (!q.options || q.options.length === 0) {
                    toast.error(t("validation.choiceOptionRequired", { index: i + 1 }));
                    return;
                }
                const emptyOptionIndex = q.options.findIndex(opt => !opt.trim());
                if (emptyOptionIndex !== -1) {
                    toast.error(
                        t("validation.choiceOptionTextRequired", {
                            index: i + 1,
                            optionIndex: emptyOptionIndex + 1,
                        })
                    );
                    return;
                }
            }
        }

        if (isNew) {
            if (targetType === "DEPT" && selectedDeptIds.length === 0) {
                toast.error(t("validation.targetDeptRequired"));
                return;
            }
            if (targetType === "GRADE" && selectedGrades.length === 0) {
                toast.error(t("validation.targetGradeRequired"));
                return;
            }
            if (targetType === "DEPT_GRADE") {
                if (selectedDeptIds.length === 0) {
                    toast.error(t("validation.deptRequired"));
                    return;
                }
                if (selectedGrades.length === 0) {
                    toast.error(t("validation.gradeRequired"));
                    return;
                }
            }
        }

        setLoading(true);

        const formatForBackend = (dString: string | undefined) => {
            if (!dString) return "";
            return dString.replace("T", " ");
        };

        const startAt = formatForBackend(dates?.startAt);
        const endAt = formatForBackend(dates?.endAt);

        const questionDtos = questions.map((q, idx) => ({
            questionText: q.questionText,
            sortOrder: idx + 1,
            minVal: q.minVal,
            maxVal: q.maxVal,
            minLabel: q.minLabel,
            maxLabel: q.maxLabel,
            isRequired: q.isRequired,
            questionType: q.questionType,
            options: q.options,
        }));

        try {
            if (isNew) {
                const filter: FilterDto = {
                    genType: targetType,
                    deptIds: (targetType === "DEPT" || targetType === "DEPT_GRADE") ? selectedDeptIds : undefined,
                    gradeLevels: (targetType === "GRADE" || targetType === "DEPT_GRADE") ? selectedGrades : undefined,
                };

                const payload: SurveyCreateRequest = {
                    type: surveyType as SurveyType,
                    title,
                    description: title,
                    startAt,
                    endAt,
                    questions: questionDtos,
                    targetFilter: filter
                };
                await createSurvey(payload);
            } else {
                const payload: SurveyPatchRequest = {
                    type: surveyType as SurveyType,
                    title,
                    description: title,
                    startAt,
                    endAt,
                    questions: questionDtos,
                };
                await patchSurvey(Number(idStr), payload);
            }

            toast.success(t("messages.saveSuccess"));
            router.push("/admin/surveys");
        } catch (e: any) {
            console.error(e);
            toast.error(e.message ?? t("messages.saveFailed"));
        } finally {
            setLoading(false);
        }
    }, [isNew, idStr, title, questions, dates, targetType, selectedDeptIds, selectedGrades, router, t]);

    return {
        state: {
            isNew,
            title,
            questions,
            dates,
            loading,
            targetType,
            selectedDeptIds,
            selectedGrades,
            surveyType,
            surveyTypes,
        },
        actions: {
            setTitle,
            setQuestions,
            setDates,
            setTargetType,
            setSelectedDeptIds,
            setSelectedGrades,
            setSurveyType,
            addQuestion,
            removeQuestion,
            updateQuestion,
            submit,
            reload: () => idStr && !isNew && load(Number(idStr)),
        }
    };
}
