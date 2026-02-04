import { getJson } from "@/lib/http";
import { QnaListResponse, QnaDetailResponse } from "./types";

export type QnaListQuery = {
    page?: number;
    size?: number;
    keyword?: string;
};

export async function fetchQnaList(query: QnaListQuery) {
    const sp = new URLSearchParams();
    if (query.page) sp.set("page", String(query.page));
    if (query.size) sp.set("size", String(query.size));
    if (query.keyword) sp.set("keyword", query.keyword);

    const qs = sp.toString();
    const url = qs
        ? `/api/professor/community/qna/questions?${qs}`
        : `/api/professor/community/qna/questions`;

    return getJson<QnaListResponse>(url);
}

export async function fetchQnaDetail(questionId: number) {
    // 교수 경로 /api/professor/community/qna/questions/[id]
    return getJson<QnaDetailResponse>(`/api/professor/community/qna/questions/${questionId}`);
}
