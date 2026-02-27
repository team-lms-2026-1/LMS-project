import { getJson, postJson, patchJson, deleteJson } from "@/lib/http";
import {
    MentoringRecruitmentListResponse,
    MentoringRecruitmentDetailResponse,
    MentoringApplicationListResponse,
    SuccessResponse,
    MentoringCreateResponse,
    MentoringRecruitmentCreateRequest,
    MentoringStatusUpdateRequest,
    MentoringMatchingRequest,
    MentoringApplicationRequest,
    MentoringMatchingListResponse,
    MentoringMatchingAdminListResponse,
    ChatHistoryResponse
} from "./types";

/** Admin API */

// 모집 공고 목록 조회
export async function fetchAdminRecruitments(params: { page?: number; size?: number; keyword?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params.page !== undefined) qs.set("page", String(params.page));
    if (params.size) qs.set("size", String(params.size));
    if (params.keyword) qs.set("keyword", params.keyword);
    if (params.status && params.status !== "ALL") qs.set("status", params.status);

    return getJson<MentoringRecruitmentListResponse>(`/api/admin/mentoring/recruitments?${qs.toString()}`);
}

// 모집 공고 생성
export async function createRecruitment(data: MentoringRecruitmentCreateRequest) {
    return postJson<MentoringCreateResponse>(`/api/admin/mentoring/recruitments`, data);
}

// 모집 공고 수정
export async function updateRecruitment(id: number, data: MentoringRecruitmentCreateRequest & { status?: string }) {
    return getJson<SuccessResponse>(`/api/admin/mentoring/recruitments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
}

// 모집 공고 삭제
export async function deleteRecruitment(id: number) {
    return deleteJson<SuccessResponse>(`/api/admin/mentoring/recruitments/${id}`);
}

// 신청자 목록 조회
export async function fetchAdminApplications(recruitmentId: number) {
    return getJson<MentoringApplicationListResponse>(`/api/admin/mentoring/recruitments/${recruitmentId}/applications`);
}

// 신청 상태 변경 (승인/반려)
export async function updateApplicationStatus(applicationId: number, data: MentoringStatusUpdateRequest) {
    return patchJson<SuccessResponse>(`/api/admin/mentoring/applications/${applicationId}/status`, data);
}

// 매칭 수행
export async function matchMentoring(data: MentoringMatchingRequest) {
    return postJson<SuccessResponse>(`/api/admin/mentoring/match`, data);
}

// 멘토링 매칭 목록 조회 (Admin)
export async function fetchAdminMatchings(recruitmentId: number) {
    return getJson<MentoringMatchingAdminListResponse>(`/api/admin/mentoring/recruitments/${recruitmentId}/matchings`);
}

// 멘토링 매칭 채팅 내역 조회 (Admin)
export async function fetchAdminChatHistory(matchingId: number) {
    return getJson<ChatHistoryResponse>(`/api/admin/mentoring/matchings/${matchingId}/chat`);
}


/** User (Student/Professor) API */

type UserRole = "student" | "professor";

// 모집 공고 목록 조회
export async function fetchRecruitments(userRole: UserRole, params: { page?: number; size?: number; keyword?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params.page !== undefined) qs.set("page", String(params.page));
    if (params.size) qs.set("size", String(params.size));
    if (params.keyword) qs.set("keyword", params.keyword);
    if (params.status) qs.set("status", params.status);

    return getJson<MentoringRecruitmentListResponse>(`/api/${userRole}/mentoring/recruitments?${qs.toString()}`);
}

// 모집 공고 상세 조회
export async function fetchRecruitment(userRole: UserRole, id: number) {
    return getJson<MentoringRecruitmentDetailResponse>(`/api/${userRole}/mentoring/recruitments/${id}`);
}

// 멘토링 신청
export async function applyMentoring(userRole: UserRole, data: MentoringApplicationRequest) {
    return postJson<SuccessResponse>(`/api/${userRole}/mentoring/applications`, data);
}

// 내 매칭 목록 조회
export async function fetchMyMatchings(userRole: UserRole) {
    return getJson<MentoringMatchingListResponse>(`/api/${userRole}/mentoring/matchings`);
}

// 채팅 내역 조회
export async function fetchChatHistory(userRole: UserRole, matchingId: number) {
    return getJson<ChatHistoryResponse>(`/api/${userRole}/mentoring/matchings/${matchingId}/chat`);
}

// 질문 등록
export async function sendQuestion(userRole: UserRole, data: { matchingId: number; content: string }) {
    return postJson<SuccessResponse>(`/api/${userRole}/mentoring/questions`, data);
}

// 답변 등록
export async function sendAnswer(userRole: UserRole, data: { questionId: number; content: string }) {
    return postJson<SuccessResponse>(`/api/${userRole}/mentoring/answers`, data);
}
