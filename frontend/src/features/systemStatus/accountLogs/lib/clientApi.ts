// lib/clientApi.ts
import type { AccountLogListResponse } from "../types";
import { getJson } from "@/lib/http";

export async function fetchAccountLogs(params: { page?: number; size?: number, keyword?: string }): Promise<AccountLogListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.size) qs.set("size", String(params.size));
  if (params.keyword && params.keyword.trim()) qs.set("keyword", params.keyword.trim());

  return getJson<AccountLogListResponse>(`/api/system-status/account-logs?${qs.toString()}`);
}
