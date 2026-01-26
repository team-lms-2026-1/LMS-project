import { getJson } from "@/lib/http";
import { SemesterCreateRequest, SuccessResponse, type SemesterListResponse } from "./types";

export type SemestersListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchSemestersList(query: SemestersListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/admin/authority/semesters?${qs}` : `/api/admin/authority/semesters`;

  return getJson<SemesterListResponse>(url);
}

export async function createSemester(body: SemesterCreateRequest) {
    return getJson<SuccessResponse>(`/api/admin/authority/semesters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
    })
}