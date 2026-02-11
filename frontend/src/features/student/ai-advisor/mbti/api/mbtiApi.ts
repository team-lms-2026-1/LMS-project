import { getJson, postJson } from "@/lib/http";
import { MbtiQuestion, MbtiResult, MbtiSubmitRequest } from "./types";

const BASE_URL = "/api/student/mbti";

export const mbtiApi = {
    getQuestions: async (): Promise<MbtiQuestion[]> => {
        return getJson<MbtiQuestion[]>(`${BASE_URL}/questions`);
    },

    submitMbti: async (data: MbtiSubmitRequest): Promise<MbtiResult> => {
        return postJson<MbtiResult>(`${BASE_URL}/submit`, data);
    },

    getLatestResult: async (): Promise<MbtiResult | null> => {
        try {
            const result = await getJson<MbtiResult>(`${BASE_URL}/result`);
            return result;
        } catch (error) {
            return null;
        }
    },
};
