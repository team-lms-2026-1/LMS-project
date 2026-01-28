import { getJson } from "@/lib/http";
import { DeptListResponse, SuccessResponse } from "./types";

export type DeptListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};


export async function fetchDeptList(query: DeptListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/admin/authority/depts?${qs}` : `/api/admin/authority/depts`;

  return getJson<DeptListResponse>(url);
}

