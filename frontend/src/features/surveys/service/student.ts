
import { getJson } from "@/lib/http";
import {
    SurveyListResponse,
    SurveyDetailResponse,
    SurveySubmitRequest,
} from "../types";

const BASE_URL = "/api/student/surveys";

export async function fetchAvailableSurveys(keyword?: string) {
    const params = new URLSearchParams();
    if (keyword && keyword.trim()) {
        params.append("keyword", keyword);
    }
    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/available?${queryString}` : `${BASE_URL}/available`;
    return getJson<SurveyListResponse[]>(url);
}

export async function fetchSurveyDetail(id: string | number) {
    return getJson<SurveyDetailResponse>(`${BASE_URL}/${id}`);
}

export async function submitSurvey(data: SurveySubmitRequest) {
    return getJson<void>(`${BASE_URL}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
