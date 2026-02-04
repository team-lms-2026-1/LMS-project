import type { AccountLogListResponse, AccountLogDetailResponse } from "../types";
import { getJson } from "@/lib/http";

export async function fetchAccountLogs(params: { page?: number; size?: number, keyword?: string }): Promise<AccountLogListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.size) qs.set("size", String(params.size));
  if (params.keyword && params.keyword.trim()) qs.set("keyword", params.keyword.trim());

  // Cache buster
  qs.set("_t", Date.now().toString());

  return getJson<AccountLogListResponse>(`/api/admin/system-status/account-logs?${qs.toString()}`);
}

export async function fetchAccountDetailLogs(
  accountId: number | string,
  params: { page?: number; size?: number; from?: string; to?: string; keyword?: string }
): Promise<AccountLogDetailResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.size) qs.set("size", String(params.size));
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.keyword && params.keyword.trim()) qs.set("keyword", params.keyword.trim());

  // Cache buster
  qs.set("_t", Date.now().toString());

  return getJson<AccountLogDetailResponse>(`/api/admin/system-status/account-logs/${accountId}/access-logs?${qs.toString()}`);
}

export async function downloadAccessLogs(payload: {
  resourceCode: string; // "ACCESS_LOG"
  reason: string;
  filter: {
    targetAccountId?: number;
    from?: string; // ISO DateTime e.g. "2026-01-01T00:00:00"
    to?: string;
  }
}): Promise<Blob> {
  const res = await fetch("/api/admin/logs/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Download failed");
  return res.blob();
}
