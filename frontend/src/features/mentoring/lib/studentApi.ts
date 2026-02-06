import { getJson, postJson } from "@/lib/http";
import type { MentoringRecruitment, MentoringApplicationRequest } from "../types";

// 학생용 모집 공고 목록 조회
export async function fetchStudentRecruitments(params: { page?: number; size?: number; keyword?: string }) {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.size) qs.set("size", String(params.size));
    if (params.keyword) qs.set("keyword", params.keyword);
    return getJson<any>(`/api/mentoring/recruitments?${qs.toString()}`);
}

// 학생 멘토링 신청
export async function applyMentoringStudent(data: MentoringApplicationRequest) {
    return postJson("/api/mentoring/applications", data);
}
