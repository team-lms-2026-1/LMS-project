"use client";

import { useCallback, useEffect, useState } from "react";
import { MbtiQuestion, MbtiResult, MbtiSubmitRequest } from "../api/types";
import { mbtiApi } from "../api/mbtiApi";

export function useMbti() {
    const [questions, setQuestions] = useState<MbtiQuestion[]>([]);
    const [result, setResult] = useState<MbtiResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check for existing result first
            const existingResult = await mbtiApi.getLatestResult();
            if (existingResult) {
                setResult(existingResult);
            } else {
                // If no result, load questions
                const questionsData = await mbtiApi.getQuestions();
                setQuestions(questionsData);
            }
        } catch (e: any) {
            console.error("[useMbti]", e);
            setError(e.message ?? "MBTI 데이터 로딩 실패");
        } finally {
            setLoading(false);
        }
    }, []);

    const submit = async (answers: Record<number, number>) => {
        try {
            setLoading(true);
            const submitData: MbtiSubmitRequest = {
                answers: Object.entries(answers).map(([qid, cid]) => ({
                    questionId: Number(qid),
                    choiceId: cid,
                })),
            };
            const newResult = await mbtiApi.submitMbti(submitData);
            setResult(newResult);
        } catch (e: any) {
            console.error("[useMbti] Submit error", e);
            setError(e.message ?? "제출 실패");
            alert("제출에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const retest = async () => {
        setResult(null);
        setLoading(true);
        try {
            const questionsData = await mbtiApi.getQuestions();
            setQuestions(questionsData);
        } catch (e: any) {
            setError(e.message ?? "질문 로딩 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [load]);

    return {
        questions,
        result,
        loading,
        error,
        submit,
        retest,
    };
}
