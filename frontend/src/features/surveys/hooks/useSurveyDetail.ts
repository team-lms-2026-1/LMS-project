"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSurvey, fetchSurveyDetail, patchSurvey } from "../api/surveysApi";
import {
    QuestionResponseDto,
    SurveyCreateRequest,
    SurveyPatchRequest,
    TargetFilterDto as FilterDto
} from "../api/types";

export function useSurveyDetail(idStr: string | undefined) {
    const router = useRouter();
    const isNew = idStr === "new";

    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState<QuestionResponseDto[]>([]);
    const [dates, setDates] = useState<{ startAt: string; endAt: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const [targetType, setTargetType] = useState<"ALL" | "DEPT" | "GRADE" | "DEPT_GRADE">("ALL");
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<number[]>([]);

    const createNewQuestion = useCallback((order: number): QuestionResponseDto => ({
        questionId: -Date.now() - Math.random(),
        questionText: "",
        sortOrder: order,
        minVal: 1,
        maxVal: 5,
        minLabel: "전혀 그렇지 않다",
        maxLabel: "매우 그렇다",
        isRequired: true,
        questionType: "RATING",
        options: []
    }), []);

    const load = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchSurveyDetail(id);
            const data = res.data;
            setTitle(data.title);
            setQuestions(data.questions || []);

            const fmt = (s: string) => s.replace(" ", "T");
            setDates({ startAt: fmt(data.startAt), endAt: fmt(data.endAt) });
        } catch (e) {
            console.error(e);
            toast.error("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

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
        }
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
            toast.error("제목을 입력해주세요.");
            return;
        }

        if (questions.length === 0) {
            toast.error("질문을 하나 이상 추가해주세요.");
            return;
        }

        const emptyQuestionIndex = questions.findIndex(q => !q.questionText.trim());
        if (emptyQuestionIndex !== -1) {
            toast.error(`${emptyQuestionIndex + 1}번 질문의 내용을 입력해주세요.`);
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "SINGLE_CHOICE") {
                if (!q.options || q.options.length === 0) {
                    toast.error(`${i + 1}번 질문에 옵션을 하나 이상 추가해주세요.`);
                    return;
                }
                const emptyOptionIndex = q.options.findIndex(opt => !opt.trim());
                if (emptyOptionIndex !== -1) {
                    toast.error(`${i + 1}번 질문의 ${emptyOptionIndex + 1}번 옵션 내용을 입력해주세요.`);
                    return;
                }
            }
        }

        if (isNew) {
            if (targetType === "DEPT" && selectedDeptIds.length === 0) {
                toast.error("대상이 될 학과를 하나 이상 선택해주세요.");
                return;
            }
            if (targetType === "GRADE" && selectedGrades.length === 0) {
                toast.error("대상이 될 학년을 하나 이상 선택해주세요.");
                return;
            }
            if (targetType === "DEPT_GRADE") {
                if (selectedDeptIds.length === 0) {
                    toast.error("학과를 선택해주세요.");
                    return;
                }
                if (selectedGrades.length === 0) {
                    toast.error("학년을 선택해주세요.");
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
                    type: "ETC",
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
                    title,
                    description: title,
                    startAt,
                    endAt,
                    questions: questionDtos,
                };
                await patchSurvey(Number(idStr), payload);
            }

            toast.success("저장되었습니다.");
            router.push("/admin/surveys");
        } catch (e: any) {
            console.error(e);
            toast.error(e.message ?? "저장에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [isNew, idStr, title, questions, dates, targetType, selectedDeptIds, selectedGrades, router]);

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
        },
        actions: {
            setTitle,
            setQuestions,
            setDates,
            setTargetType,
            setSelectedDeptIds,
            setSelectedGrades,
            addQuestion,
            removeQuestion,
            updateQuestion,
            submit,
            reload: () => idStr && !isNew && load(Number(idStr)),
        }
    };
}
