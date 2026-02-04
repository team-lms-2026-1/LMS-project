import type {
  RentalListParams,
  RentalListResponse,
  RentalDetailResponse,
  CancelRentalResponse,
  AuthMeResponse,
} from "./types";

const BASE = "/api/student/study-space/spaces-rentals";
const AUTH_ME = "/api/auth/me";

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

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const rentalsApi = {
  /** ✅ 내 정보 */
  async me(): Promise<AuthMeResponse> {
    return requestJson<AuthMeResponse>(AUTH_ME, { method: "GET" });
  },

  /** ✅ 내 예약 목록(백엔드가 이미 내것만 주면 그대로, 아니면 hook에서 me로 필터) */
  async list(params: RentalListParams): Promise<RentalListResponse> {
    const qs = toQuery(params);
    return requestJson<RentalListResponse>(`${BASE}${qs}`, { method: "GET" });
  },

  /** ✅ 단건 상세(반려 사유 확인 등) */
  async detail(rentalId: number): Promise<RentalDetailResponse> {
    return requestJson<RentalDetailResponse>(`${BASE}/${rentalId}`, { method: "GET" });
  },

  /** ✅ 취소 (네 BFF/백엔드에 맞춰 PATCH /cancel 유지) */
  async cancel(rentalId: number): Promise<CancelRentalResponse> {
    return requestJson<CancelRentalResponse>(`${BASE}/${rentalId}/cancel`, {
      method: "PATCH",
    });
  },
} as const;
