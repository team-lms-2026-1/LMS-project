import type {
  SpaceListParams,
  SpaceListResponse,
  SpaceDetailResponse,
  DeleteSpaceResponse,
  UpdateSpaceDetailRequestDto,
  UpdateSpaceDetailResponse,
  CreateSpaceDetailRequestDto,
  CreateSpaceDetailResponse,
  AdminRoomListResponse,
  AdminRoomDetailResponse,
  CreateAdminRoomRequestDto,
  UpdateAdminRoomRequestDto,
  SuccessResponse,
} from "./types";

const BASE = "/api/admin/study-space/spaces";

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

async function requestMultipart<T>(url: string, method: "POST" | "PATCH" | "PUT", fd: FormData): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

function appendRequiredImage(fd: FormData, imageFile?: File | null) {
  if (imageFile) {
    fd.append("image", imageFile);
    return;
  }
  // Backend requires an "image" part even when not changing the image.
  fd.append("image", new Blob([], { type: "application/octet-stream" }), "empty");
}

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

  /** 삭제 */
  async remove(spaceId: number): Promise<DeleteSpaceResponse> {
    return requestJson<DeleteSpaceResponse>(`${BASE}/${spaceId}`, { method: "DELETE" });
  },

  /** ✅ 상세 수정: multipart(form-data) - data(json) + image(file) */
  async updateDetailMultipart(
    spaceId: number,
    dto: UpdateSpaceDetailRequestDto,
    imageFile?: File | null
  ): Promise<UpdateSpaceDetailResponse> {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
    appendRequiredImage(fd, imageFile);
    return requestMultipart<UpdateSpaceDetailResponse>(`${BASE}/${spaceId}/edit`, "PATCH", fd);
  },

  /** ✅ 등록: multipart(form-data) - data(json) + image(file) */
  async createDetailMultipart(
    dto: CreateSpaceDetailRequestDto,
    imageFile?: File | null
  ): Promise<CreateSpaceDetailResponse> {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
    appendRequiredImage(fd, imageFile);
    return requestMultipart<CreateSpaceDetailResponse>(`${BASE}/new`, "POST", fd);
  },
} as const;

/* =========================
 * ✅ Rooms API
 * ========================= */
const ROOMS_BASE = (spaceId: number) => `${BASE}/${spaceId}/rooms`;

export const roomsApi = {
  async list(spaceId: number): Promise<AdminRoomListResponse> {
    return requestJson<AdminRoomListResponse>(ROOMS_BASE(spaceId), { method: "GET" });
  },

  async detail(spaceId: number, roomId: number): Promise<AdminRoomDetailResponse> {
    return requestJson<AdminRoomDetailResponse>(`${ROOMS_BASE(spaceId)}/${roomId}`, { method: "GET" });
  },

  async create(spaceId: number, body: CreateAdminRoomRequestDto): Promise<AdminRoomDetailResponse> {
    return requestJson<AdminRoomDetailResponse>(ROOMS_BASE(spaceId), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async update(spaceId: number, roomId: number, body: UpdateAdminRoomRequestDto): Promise<AdminRoomDetailResponse> {
    return requestJson<AdminRoomDetailResponse>(`${ROOMS_BASE(spaceId)}/${roomId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async remove(spaceId: number, roomId: number): Promise<SuccessResponse> {
    return requestJson<SuccessResponse>(`${ROOMS_BASE(spaceId)}/${roomId}`, { method: "DELETE" });
  },
} as const;
