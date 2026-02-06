import { getJson, postJson } from "@/lib/http";
import type { MentoringRecruitment, MentoringApplication, MentoringApplicationRequest } from "../types";

// 교수용 모집 공고 목록 조회 (공통 API 사용)
export async function fetchProfessorRecruitments(params: { page?: number; size?: number; keyword?: string }) {
    const qs = new URLSearchParams();
    if (params.page !== undefined) qs.set("page", String(params.page));
    if (params.size) qs.set("size", String(params.size));
    if (params.keyword) qs.set("keyword", params.keyword);
    return getJson<any>(`/api/mentoring/recruitments?${qs.toString()}`);
}

// 교수용 특정 모집 공고의 신청자 목록 조회
export async function fetchRecruitmentApplications(recruitmentId: number) {
    return getJson<MentoringApplication[]>(`/api/admin/mentoring/recruitments/${recruitmentId}/applications`);
}

// 교수용 모집 공고 상세 조회
export async function fetchRecruitmentDetail(recruitmentId: number) {
    return getJson<MentoringRecruitment>(`/api/mentoring/recruitments/${recruitmentId}`);
}

// 교수 멘토 신청
export async function applyMentoringAsMentor(data: MentoringApplicationRequest) {
    return postJson("/api/mentoring/applications", data);
}
