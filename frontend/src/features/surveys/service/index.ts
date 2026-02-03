import { getJson } from "@/lib/http";
import {
    SurveyDetailResponse,
    SurveyListResponse,
    SurveyCreateRequest,
    SurveyUpdateRequest,
    SurveyStatsResponse,
} from "../types";

// Updated to point to Frontend BFF Routes (which will proxy to /api/v1/...)
const BASE_URL = "/api/admin/surveys";

export async function getSurveyList(page: number, size: number, query?: string) {
    const params = new URLSearchParams({
        page: String(page - 1),
        size: String(size),
        ...(query ? { keyword: query } : {}),
    });

    try {
        const res = await getJson<any>(`${BASE_URL}?${params.toString()}`);
        return {
            items: res.content as SurveyListResponse[],
            totalItems: res.totalElements as number,
            page: res.number + 1,
            size: res.size,
        };
    } catch (e) {
        console.warn("API Call Failed:", e);
        throw e;
    }
}

export async function getSurveyDetail(id: number) {
    // Detail uses the public endpoint via proxy (handled by route.ts)
    return getJson<SurveyDetailResponse>(`${BASE_URL}/${id}`);
}

export async function createSurvey(data: SurveyCreateRequest) {
    return getJson<number>(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSurvey(id: number, data: SurveyUpdateRequest) {
    return getJson<void>(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSurvey(id: number) {
    return getJson<void>(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
}

export async function getSurveyStats(id: number) {
    return getJson<SurveyStatsResponse>(`${BASE_URL}/${id}/stats`);
}
