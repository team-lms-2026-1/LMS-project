import { getJson, postJson } from "@/lib/http";
import { MbtiQuestion, MbtiResult, MbtiSubmitRequest, ApiResponse } from "./types";

const BASE_URL = "/api/student/mbti";

export const mbtiApi = {
    getQuestions: async (): Promise<MbtiQuestion[]> => {
        const response = await getJson<ApiResponse<MbtiQuestion[]>>(`${BASE_URL}/questions`);
        return response.data;
    },

    submitMbti: async (data: MbtiSubmitRequest): Promise<MbtiResult> => {
        const response = await postJson<ApiResponse<MbtiResult>>(`${BASE_URL}/submit`, data);
        return response.data;
    },

    getLatestResult: async (): Promise<MbtiResult | null> => {
        try {
            const response = await getJson<ApiResponse<MbtiResult>>(`${BASE_URL}/result`);
            return response.data;
        } catch (error) {
            return null;
        }
    },
};
