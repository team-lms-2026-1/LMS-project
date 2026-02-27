import { getJson, postJson, patchJson, deleteJson } from "@/lib/http";
import {
    SurveyDetailResponse,
    SurveyListResponse,
    SurveyCreateRequest,
    SurveyPatchRequest,
    SurveyStatsResponse,
    SurveyParticipantResponse,
} from "./types";
import { SuccessResponse } from "@/features/admin/curricular/api/types";

const BASE_URL = "/api/admin/surveys";

export async function fetchSurveyTypes() {
    return getJson<import("./types").ApiResponse<import("./types").SurveyTypeResponse[], null>>(`${BASE_URL}/types`);
}

export async function fetchSurveysList(page: number, size: number, keyword?: string, type?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        ...(keyword ? { keyword } : {}),
        ...(type ? { type } : {}),
    });

    return getJson<SurveyListResponse>(`${BASE_URL}?${params.toString()}`);
}

export async function fetchSurveyDetail(id: number) {
    return getJson<SurveyDetailResponse>(`${BASE_URL}/${id}`);
}

export async function createSurvey(data: SurveyCreateRequest) {
    return postJson<SuccessResponse>(BASE_URL, data);
}

export async function patchSurvey(id: number, data: SurveyPatchRequest) {
    return patchJson<SuccessResponse>(`${BASE_URL}/${id}`, data);
}

export async function deleteSurvey(id: number) {
    return deleteJson<SuccessResponse>(`${BASE_URL}/${id}`);
}

export async function fetchSurveyStats(id: number) {
    return getJson<SurveyStatsResponse>(`${BASE_URL}/${id}/stats`);
}

export async function fetchSurveyParticipants(id: number, page: number, size: number, status?: string) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        ...(status ? { status } : {}),
    });
    return getJson<SurveyParticipantResponse>(`${BASE_URL}/${id}/participants?${params.toString()}`);
}
