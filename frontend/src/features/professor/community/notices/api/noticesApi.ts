import { getJson } from "@/lib/http";
import { NoticeListResponse } from "./types";

export type NoticesListQuery = {
    page?: number;
    size?: number;
    keyword?: string;
};

export async function fetchNoticesList(query: NoticesListQuery) {
    const sp = new URLSearchParams();
    if (query.page) sp.set("page", String(query.page));
    if (query.size) sp.set("size", String(query.size));
    if (query.keyword) sp.set("keyword", query.keyword);

    const qs = sp.toString();
    const url = qs
        ? `/api/professor/community/notices?${qs}`
        : `/api/professor/community/notices`;

    return getJson<NoticeListResponse>(url);
}

export async function fetchNoticeDetail(noticeId: number) {
    return getJson<any>(`/api/professor/community/notices/${noticeId}`);
}
