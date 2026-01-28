import { getJson } from "@/lib/http";
import { CurricularListResponse } from "./types";

export type CurricularsListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  deptId?: number;
};

export async function fetchCurricularsList(query: CurricularsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.deptId != null) {
    sp.set("deptId", String(query.deptId));
  }

  const qs = sp.toString();
  const url = qs ? `/api/admin/curricular/curriculars?${qs}` : `/api/admin/curricular/curriculars`;

  return getJson<CurricularListResponse>(url);
}