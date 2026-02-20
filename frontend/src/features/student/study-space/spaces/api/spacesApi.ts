import type {
  SpaceListParams,
  SpaceListResponse,
  SpaceDetailResponse,
  RoomListResponse,
  RoomDetailResponse,
  CreateRoomReservationRequestDto,
  CreateRoomReservationResponse,
} from "./types";


const BASE = "/api/student/study-space/spaces";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include", cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

function toQuery(params: SpaceListParams) {
  const sp = new URLSearchParams();
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.isActive === "boolean") sp.set("isActive", String(params.isActive));
  if (typeof params.isRentable === "boolean") sp.set("isRentable", String(params.isRentable));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/* =========================
 * ✅ Student Spaces API (조회)
 * ========================= */
export const spacesApi = {
  /** 목록 */
  async list(params: SpaceListParams = {}): Promise<SpaceListResponse> {
    const qs = toQuery(params);
    return requestJson<SpaceListResponse>(`${BASE}${qs}`, { method: "GET" });
  },

  /** 단건 상세 */
  async detail(spaceId: number): Promise<SpaceDetailResponse> {
    return requestJson<SpaceDetailResponse>(`${BASE}/${spaceId}`, { method: "GET" });
  },
} as const;

/* =========================
 * ✅ Student Rooms API (조회 + 예약신청)
 * ========================= */
const ROOMS_BASE = (spaceId: number) => `${BASE}/${spaceId}/rooms`;

export const roomsApi = {

  async list(spaceId: number): Promise<RoomListResponse> {
    return requestJson<RoomListResponse>(ROOMS_BASE(spaceId), { method: "GET" });
  },


  async detail(spaceId: number, roomId: number): Promise<RoomDetailResponse> {
    return requestJson<RoomDetailResponse>(`${ROOMS_BASE(spaceId)}/${roomId}`, { method: "GET" });
  },


  async reserve(spaceId: number, body: CreateRoomReservationRequestDto): Promise<CreateRoomReservationResponse> {
    return requestJson<CreateRoomReservationResponse>(ROOMS_BASE(spaceId), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  },
} as const;
