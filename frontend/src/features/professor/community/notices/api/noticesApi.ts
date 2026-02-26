import { getJson } from "@/lib/http";
import { NoticeListResponse, NoticeCategoryListResponse } from "./types";

export type NoticesListQuery = {
    page?: number;
    size?: number;
    keyword?: string;
    categoryId?: number;
};

export async function fetchNoticesList(query: NoticesListQuery) {
    const sp = new URLSearchParams();
    if (query.page) sp.set("page", String(query.page));
    if (query.size) sp.set("size", String(query.size));
    if (query.keyword) sp.set("keyword", query.keyword);
    if (typeof query.categoryId === "number") sp.set("categoryId", String(query.categoryId));

    const qs = sp.toString();
    const url = qs
        ? `/api/professor/community/notices?${qs}`
        : `/api/professor/community/notices`;

    return getJson<NoticeListResponse>(url);
}

export async function fetchNoticeCategories() {
    return getJson<NoticeCategoryListResponse>(`/api/professor/community/notices/categories`);
}

export async function fetchNoticeDetail(noticeId: number) {
    return getJson<any>(`/api/professor/community/notices/${noticeId}`);
}
