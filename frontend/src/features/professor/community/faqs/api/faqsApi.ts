import { getJson } from "@/lib/http";
import { FaqListResponse } from "./types";

export type FaqListQuery = {
    page?: number;
    size?: number;
    keyword?: string;
    categoryId?: number;
};

export async function fetchFaqList(query: FaqListQuery) {
    const sp = new URLSearchParams();
    if (query.page) sp.set("page", String(query.page));
    if (query.size) sp.set("size", String(query.size));
    if (query.keyword) sp.set("keyword", query.keyword);
    if (query.categoryId) sp.set("categoryId", String(query.categoryId));

    const qs = sp.toString();
    const url = qs
        ? `/api/professor/community/faqs?${qs}`
        : `/api/professor/community/faqs`;

    return getJson<FaqListResponse>(url);
}

export async function fetchFaqDetail(faqId: number) {
    return getJson<any>(`/api/professor/community/faqs/${faqId}`);
}
