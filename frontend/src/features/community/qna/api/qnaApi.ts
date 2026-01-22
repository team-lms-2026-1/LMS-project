import { getJson } from "@/lib/http";
import type {
  QnaListParams,
  QnaListResponseDto,
  QnaListItemDto,
  CreateQnaRequestDto,
  UpdateQnaRequestDto,
} from "./dto";

const BASE = "/api/community/qna";

function toQuery(params: QnaListParams) {
  const sp = new URLSearchParams();
  if (params.category && params.category !== "전체") sp.set("category", params.category);
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeList(payload: any): QnaListItemDto[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export const qnaApi = {
  async list(params: QnaListParams): Promise<QnaListItemDto[]> {
    const payload = await getJson<QnaListResponseDto>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },

  get(qnaId: string) {
    return getJson<QnaListItemDto>(`${BASE}/${encodeURIComponent(qnaId)}`);
  },

  create(body: CreateQnaRequestDto) {
    return getJson(`${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  update(qnaId: string, body: UpdateQnaRequestDto) {
    return getJson(`${BASE}/${encodeURIComponent(qnaId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  remove(qnaId: string) {
    return getJson(`${BASE}/${encodeURIComponent(qnaId)}`, { method: "DELETE" });
  },
};
