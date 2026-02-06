import { getJson, postJson, patchJson } from "@/lib/http";
import type {
    MentoringRecruitment,
    MentoringRecruitmentCreateRequest,
    MentoringApplication,
    MentoringStatusUpdateRequest,
    MentoringMatchingRequest
} from "../types";

const BASE_URL = "/api/admin/mentoring";

// 모집 공고 목록 조회
export async function fetchRecruitments(params: { page?: number; size?: number; keyword?: string }) {
    const qs = new URLSearchParams();
    if (params.page !== undefined) qs.set("page", String(params.page));
    if (params.size) qs.set("size", String(params.size));
    if (params.keyword) qs.set("keyword", params.keyword);

    // BFF Route: /api/admin/mentoring/recruitments
    return getJson<any>(`/api/admin/mentoring/recruitments?${qs.toString()}`);
}

// 모집 공고 상세 조회
export async function fetchRecruitment(id: number) {
    return getJson<MentoringRecruitment>(`/api/admin/mentoring/recruitments/${id}`);
}

// 모집 공고 생성
export async function createRecruitment(data: MentoringRecruitmentCreateRequest) {
    return postJson<number>(`${BASE_URL}/recruitments`, data);
}

// 신청 내역 조회
export async function fetchApplications(recruitmentId: number) {
    return getJson<MentoringApplication[]>(`${BASE_URL}/recruitments/${recruitmentId}/applications`);
}

// 신청 상태 변경 (승인/반려)
export async function updateApplicationStatus(applicationId: number, data: MentoringStatusUpdateRequest) {
    return patchJson(`${BASE_URL}/applications/${applicationId}/status`, data);
}

// 매칭 수행
export async function matchMentoring(data: MentoringMatchingRequest) {
    return postJson(`${BASE_URL}/match`, data);
}

// 모집 공고 수정
export async function updateRecruitment(id: number, data: MentoringRecruitmentCreateRequest & { status?: string }) {
    // DTO가 다르지만 편의상 CreateRequest + status로 처리
    return getJson(`${BASE_URL}/recruitments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
}

// 모집 공고 삭제
export async function deleteRecruitment(id: number) {
    return getJson(`${BASE_URL}/recruitments/${id}`, {
        method: "DELETE"
    });
}
