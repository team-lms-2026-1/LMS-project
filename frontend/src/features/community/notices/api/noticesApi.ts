import type {
  ApiResponse,
  NoticeListParams,
  NoticeListItemDto,
  NoticeDetailDto,
  CreateNoticeRequestDto,
  UpdateNoticeRequestDto,
} from "./dto";

const BASE = "/api/community/notices";

function toQuery(params: NoticeListParams) {
  const sp = new URLSearchParams();

  if (params.category && params.category !== "전체") sp.set("category", params.category);
  if (params.keyword && params.keyword.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  return data as T;
}

/** 서버가 ApiResponse 래핑이면 unwrap */
function unwrap<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in (payload as any)) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
}

export const noticesApi = {
  async list(params: NoticeListParams): Promise<NoticeListItemDto[]> {
    const res = await fetch(`${BASE}${toQuery(params)}`, { cache: "no-store" });
    if (!res.ok) throw new Error((await parseJson<any>(res))?.message ?? `HTTP ${res.status}`);
    const payload = await parseJson<ApiResponse<NoticeListItemDto[]> | NoticeListItemDto[]>(res);
    return unwrap(payload) ?? [];
  },

  async detail(noticeId: string): Promise<NoticeDetailDto> {
    const res = await fetch(`${BASE}/${encodeURIComponent(noticeId)}`, { cache: "no-store" });
    if (!res.ok) throw new Error((await parseJson<any>(res))?.message ?? `HTTP ${res.status}`);
    const payload = await parseJson<ApiResponse<NoticeDetailDto> | NoticeDetailDto>(res);
    return unwrap(payload);
  },

  async create(body: CreateNoticeRequestDto): Promise<unknown> {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await parseJson<any>(res))?.message ?? `HTTP ${res.status}`);
    return await parseJson(res);
  },

  async update(noticeId: string, body: UpdateNoticeRequestDto): Promise<unknown> {
    const res = await fetch(`${BASE}/${encodeURIComponent(noticeId)}`, {
      method: "PUT", // 백엔드가 PATCH면 PATCH로 변경
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await parseJson<any>(res))?.message ?? `HTTP ${res.status}`);
    return await parseJson(res);
  },

  async remove(noticeId: string): Promise<unknown> {
    const res = await fetch(`${BASE}/${encodeURIComponent(noticeId)}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await parseJson<any>(res))?.message ?? `HTTP ${res.status}`);
    return await parseJson(res);
  },
};
