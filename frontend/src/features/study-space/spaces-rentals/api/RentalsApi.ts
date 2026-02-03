import type {
    RentalListParams,
    RentalListResponse,
    SuccessResponse,
} from "./types";

const BASE = "/api/admin/study-space/spaces-rentals";

/** 공통 JSON 요청 헬퍼 */
async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, { ...init, credentials: "include" });

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
    return sp.toString() ? `?${sp.toString()}` : "";
}

export const rentalsApi = {
    /** 목록 조회 */
    async list(params: RentalListParams = {}): Promise<RentalListResponse> {
        const qs = toQuery(params);
        // TODO: 백엔드 API 경로 확인 필요. 현재는 가상의 경로 사용.
        // 만약 백엔드가 아직 없다면 mock 데이터를 반환하도록 수정 가능.
        return requestJson<RentalListResponse>(`${BASE}${qs}`, { method: "GET" });
    },

    /** 승인 */
    async approve(rentalId: number): Promise<SuccessResponse> {
        return requestJson<SuccessResponse>(`${BASE}/${rentalId}/approve`, { method: "POST" });
    },

    /** 반려 */
    async reject(rentalId: number): Promise<SuccessResponse> {
        return requestJson<SuccessResponse>(`${BASE}/${rentalId}/reject`, { method: "POST" });
    },
} as const;
