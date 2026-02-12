import { getJson } from "@/lib/http";
import { MbtiQuestionResponse, MbtiSubmitRequest, MbtiResultResponse } from "./types";
import { SuccessResponse } from "@/features/ai/api/types";

export async function fetchMbtiQuestions() {
    const url = `/api/student/mbti/questions`
    return getJson<MbtiQuestionResponse>(url, {
        cache: "no-store"
    });
}

export async function submitMbtiAnswers(body: MbtiSubmitRequest) {
    const url = `/api/student/mbti/submit`;
    return getJson<MbtiResultResponse>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
    });
}

export async function fetchMbtiResult() {
    const url = `/api/student/mbti/result`
    return getJson<MbtiResultResponse>(url, {
        cache: "no-store"
    });
}