
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSurvey, getSurveyDetail, updateSurvey } from "../service";
import {
    QuestionResponseDto,
    SurveyCreateRequest,
    SurveyUpdateRequest,
    TargetFilterDto as FilterDto
} from "../types";

export function useSurveyDetail(idStr: string | undefined) {
    const router = useRouter();
    const isNew = idStr === "new";

    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState<QuestionResponseDto[]>([]);
    const [dates, setDates] = useState<{ startAt: string; endAt: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Target Filtering State
    // [수정] 복합 조건도 지원하기 위해 상태를 좀 더 유연하게 관리할 수도 있지만,
    // 여기서는 UI상으로는 "직접 지정(DEPT+GRADE)" 옵션을 추가함
    const [targetType, setTargetType] = useState<"ALL" | "DEPT" | "GRADE" | "DEPT_GRADE">("ALL");
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<number[]>([]);


    const createNewQuestion = (order: number): QuestionResponseDto => ({
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
    });

    const loadData = async (id: number) => {
        setLoading(true);
        try {
            const data = await getSurveyDetail(id);
            setTitle(data.title);
            setQuestions(data.questions || []);
            setDates({ startAt: data.startAt, endAt: data.endAt });
        } catch (e) {
            console.error(e);

            toast.error("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isNew && idStr) {
            loadData(Number(idStr));
        } else {
            setTitle("");
            setQuestions([createNewQuestion(1)]);

            const n = new Date();
            const next = new Date();
            next.setDate(n.getDate() + 7); // Default 7 days

            // Simple formatter for local datetime-local (YYYY-MM-DDTHH:mm)
            const fmt = (d: Date) => {
                const pad = (num: number) => String(num).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };

            setDates({ startAt: fmt(n), endAt: fmt(next) });

            setTargetType("ALL");
        }
    }, [idStr, isNew]);

    const addQuestion = () => {
        setQuestions((prev) => [...prev, createNewQuestion(prev.length + 1)]);
    };

    const removeQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, updates: Partial<QuestionResponseDto>) => {
        setQuestions((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    };



    const submitSurvey = async () => {
        if (!title.trim()) {
            toast.error("제목을 입력해주세요.");
            return;
        }

        // 질문이 하나도 없는 경우
        if (questions.length === 0) {
            toast.error("질문을 하나 이상 추가해주세요.");
            return;
        }

        // 빈 질문이 있는지 확인
        const emptyQuestionIndex = questions.findIndex(q => !q.questionText.trim());
        if (emptyQuestionIndex !== -1) {
            toast.error(`${emptyQuestionIndex + 1}번 질문의 내용을 입력해주세요.`);
            return;
        }

        // 객관식 질문의 옵션 검증
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "SINGLE_CHOICE") {
                // 옵션이 없는 경우
                if (!q.options || q.options.length === 0) {
                    toast.error(`${i + 1}번 질문에 옵션을 하나 이상 추가해주세요.`);
                    return;
                }
                // 빈 옵션이 있는지 확인
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

        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const formatForBackend = (dString: string | undefined, defaultDate: Date) => {
            if (!dString) return defaultDate.toISOString().slice(0, 16).replace("T", " ");
            return dString.replace("T", " ");
        };

        const startAt = formatForBackend(dates?.startAt, now);
        const endAt = formatForBackend(dates?.endAt, nextWeek);

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
                    type: "ETC", // Default
                    title,
                    description: title,
                    startAt,
                    endAt,
                    questions: questionDtos,
                    targetFilter: filter
                };
                await createSurvey(payload);
            } else {
                const payload: SurveyUpdateRequest = {
                    title,
                    description: title,
                    startAt,
                    endAt,
                    questions: questionDtos,
                };
                await updateSurvey(Number(idStr), payload);
            }

            toast.success("저장되었습니다.");
            router.push("/admin/surveys");
        } catch (e) {
            console.error(e);
            toast.error("저장에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return {
        isNew,
        title,
        setTitle,
        questions,
        loading,
        addQuestion,
        removeQuestion,
        updateQuestion,
        submitSurvey,
        // Target Filter Props
        targetType,

        setTargetType,
        selectedDeptIds,
        setSelectedDeptIds,
        selectedGrades,
        setSelectedGrades,
        // Date Props
        dates,
        setDates,
    };
}
