import type { RentalListParams, RentalListResponse, SuccessResponse } from "./types";

const BASE = "/api/admin/study-space/spaces-rentals";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include", cache: "no-store", });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

function toQuery(params: RentalListParams) {
  const sp = new URLSearchParams();
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (params.sort) {
    if (Array.isArray(params.sort)) params.sort.forEach((s) => sp.append("sort", s));
    else sp.set("sort", params.sort);
  }
  return sp.toString() ? `?${sp.toString()}` : "";
}

export const rentalsApi = {
  async list(params: RentalListParams = {}): Promise<RentalListResponse> {
    const qs = toQuery(params);
    return requestJson<RentalListResponse>(`${BASE}${qs}`, { method: "GET" });
  },

  /** ✅ 승인: PATCH로 status 변경 */
    async approve(rentalId: number): Promise<SuccessResponse> {
    return requestJson<SuccessResponse>(`${BASE}/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
    });
    },

  /** ✅ 반려: PATCH로 status + reason 전달 */
  async reject(rentalId: number, rejectionReason: string): Promise<SuccessResponse> {
    return requestJson<SuccessResponse>(`${BASE}/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", rejectionReason }),
    });
    },
} as const;
