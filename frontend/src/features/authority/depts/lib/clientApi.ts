// lib/clientApi.ts
import { getJson } from "@/lib/http";
import type {
  DeptListResponse,
} from "../types"

/**
 * 학과 목록 조회
 */
export async function fetchDepartments(params?: {
  page?: number;
  size?: number;
  keyword?: string;
}): Promise<DeptListResponse> {
  const qs = new URLSearchParams();

  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));
  if (params?.keyword && params.keyword.trim()) {
    qs.set("keyword", params.keyword.trim());
  }

  const query = qs.toString();
  const url = query
    ? `/api/admin/departments?${query}`
    : `/api/admin/departments`;

  return getJson<DeptListResponse>(url);
}
