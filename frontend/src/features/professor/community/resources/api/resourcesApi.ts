import { getJson } from "@/lib/http";
import { ResourceListResponse, ResourceCategoryListResponse } from "./types";

export type ResourcesListQuery = {
    page?: number;
    size?: number;
    keyword?: string;
    categoryId?: number;
};

export async function fetchResourcesList(query: ResourcesListQuery) {
    const sp = new URLSearchParams();
    if (query.page) sp.set("page", String(query.page));
    if (query.size) sp.set("size", String(query.size));
    if (query.keyword) sp.set("keyword", query.keyword);
    if (typeof query.categoryId === "number") sp.set("categoryId", String(query.categoryId));

    const qs = sp.toString();
    const url = qs
        ? `/api/professor/community/resources?${qs}`
        : `/api/professor/community/resources`;

    return getJson<ResourceListResponse>(url);
}

export async function fetchResourceCategories() {
    return getJson<ResourceCategoryListResponse>(`/api/professor/community/resources/categories`);
}

export async function fetchResourceDetail(resourceId: number) {
    return getJson<any>(`/api/professor/community/resources/${resourceId}`);
}
