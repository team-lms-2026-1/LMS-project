import { getJson, postJson } from "@/lib/http";
import {
    SurveyListItemDto,
    SurveyDetailResponse,
    SurveySubmitRequest,
    SurveyListResponse,
} from "./types";
import { SuccessResponse } from "@/features/curricular/api/types";

const BASE_URL = "/api/student/surveys";

export async function fetchAvailableSurveys(page: number, size: number, keyword?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        ...(keyword ? { keyword } : {}),
    });

    return getJson<SurveyListResponse>(`${BASE_URL}/available?${params.toString()}`);
}

export async function fetchSurveyDetail(id: string | number) {
    return getJson<SurveyDetailResponse>(`${BASE_URL}/${id}`);
}

export async function submitSurvey(data: SurveySubmitRequest) {
    return postJson<SuccessResponse>(`${BASE_URL}/submit`, data);
}
