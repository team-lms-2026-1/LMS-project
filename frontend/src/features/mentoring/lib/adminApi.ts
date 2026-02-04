import { getJson, postJson, patchJson } from "@/lib/http";
import type {
    MentoringRecruitment,
    MentoringApplication,
    MentoringMatchingRequest,
    MentoringStatusUpdateRequest
} from "../types";

// 관리자용 모집 공고 목록 조회
export async function fetchAdminRecruitments(params: { page?: number; size?: number }) {
    const qs = new URLSearchParams();
    if (params.page !== undefined) qs.set("page", String(params.page));
    if (params.size) qs.set("size", String(params.size));
    return getJson<any>(`/api/mentoring/recruitments?${qs.toString()}`);
}

// 관리자용 신청자 목록 조회
export async function fetchAdminApplications(recruitmentId: number) {
    return getJson<MentoringApplication[]>(`/api/admin/mentoring/recruitments/${recruitmentId}/applications`);
}

// 멘토-멘티 매칭
export async function matchMentoring(data: MentoringMatchingRequest) {
    return postJson("/api/admin/mentoring/match", data);
}

// 신청 상태 변경 (승인/반려)
export async function updateApplicationStatus(applicationId: number, data: MentoringStatusUpdateRequest) {
    return patchJson(`/api/admin/mentoring/applications/${applicationId}/status`, data);
}
