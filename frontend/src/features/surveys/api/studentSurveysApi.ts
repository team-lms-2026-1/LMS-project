import { getJson, postJson } from "@/lib/http";
import {
    SurveyListItemDto,
    SurveyDetailResponse,
    SurveySubmitRequest,
    SurveyListResponse,
    SurveyTypeResponse,
} from "./types";
import { SuccessResponse } from "@/features/curricular/api/types";

const BASE_URL = "/api/student/surveys";

export async function fetchSurveyTypes() {
    return getJson<import("./types").ApiResponse<SurveyTypeResponse[], null>>(`${BASE_URL}/types`);
}

export async function fetchAvailableSurveys(page: number, size: number, keyword?: string, type?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        ...(keyword ? { keyword } : {}),
        ...(type ? { type } : {}),
    });

    return getJson<SurveyListResponse>(`${BASE_URL}/available?${params.toString()}`);
}

export async function fetchSurveyDetail(id: string | number) {
    return getJson<SurveyDetailResponse>(`${BASE_URL}/${id}`);
}

export async function submitSurvey(data: SurveySubmitRequest) {
    return postJson<SuccessResponse>(`${BASE_URL}/submit`, data);
}
