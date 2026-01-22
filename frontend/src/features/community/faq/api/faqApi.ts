import { getJson } from "@/lib/http";
import type {
  FaqListParams,
  FaqListResponseDto,
  FaqListItemDto,
  CreateFaqRequestDto,
  UpdateFaqRequestDto,
} from "./dto";

const BASE = "/api/community/faq";

function toQuery(params: FaqListParams) {
  const sp = new URLSearchParams();
  if (params.category && params.category !== "전체") sp.set("category", params.category);
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeList(payload: any): FaqListItemDto[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export const faqApi = {
  async list(params: FaqListParams): Promise<FaqListItemDto[]> {
    const payload = await getJson<FaqListResponseDto>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },

  get(faqId: string) {
    return getJson<FaqListItemDto>(`${BASE}/${encodeURIComponent(faqId)}`);
  },

  create(body: CreateFaqRequestDto) {
    return getJson(`${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  update(faqId: string, body: UpdateFaqRequestDto) {
    return getJson(`${BASE}/${encodeURIComponent(faqId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  remove(faqId: string) {
    return getJson(`${BASE}/${encodeURIComponent(faqId)}`, { method: "DELETE" });
  },
};
