import { getJson } from "@/lib/http";
import type {
  NoticeCategoryListParams,
  NoticeCategoryListResponseDto,
  CreateNoticeCategoryRequestDto,
  UpdateNoticeCategoryRequestDto,
} from "./dto";
import type { NoticeCategoryRow } from "../types";

const BASE = "/api/community/notice-categories";

function toQuery(params: NoticeCategoryListParams) {
  const sp = new URLSearchParams();
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// ✅ 백엔드 응답 형태가 (배열) or ({items,total}) 둘 다 지원하도록 정규화
function normalizeList(payload: NoticeCategoryListResponseDto): NoticeCategoryRow[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray((payload as any).items)) {
    return (payload as any).items;
  }
  return [];
}

export const noticeCategoriesApi = {
  async list(params: NoticeCategoryListParams): Promise<NoticeCategoryRow[]> {
    const payload = await getJson<NoticeCategoryListResponseDto>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },

  async create(body: CreateNoticeCategoryRequestDto) {
    return getJson(`${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async update(categoryId: string, body: UpdateNoticeCategoryRequestDto) {
    return getJson(`${BASE}/${encodeURIComponent(categoryId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async remove(categoryId: string) {
    return getJson(`${BASE}/${encodeURIComponent(categoryId)}`, {
      method: "DELETE",
    });
  },
};
