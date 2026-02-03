
import { getJson } from "@/lib/http";
import {
    SurveyListResponse,
    SurveyDetailResponse,
    SurveySubmitRequest,
} from "../types";

const BASE_URL = "/api/student/surveys";

export async function fetchAvailableSurveys() {
    return getJson<SurveyListResponse[]>(`${BASE_URL}/available`);
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
