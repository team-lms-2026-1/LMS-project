import { getJson } from "@/lib/http";
import type {
  NoticeCategoryListParams,
  NoticeCategoryListResponseDto,
  CreateNoticeCategoryRequestDto,
  UpdateNoticeCategoryRequestDto,
  NoticeCategoryBackendRow,
} from "./dto";
import type { NoticeCategoryRow } from "../types";

const BASE = "/api/admin/community/notice-categories";

function toQuery(params: NoticeCategoryListParams) {
  const sp = new URLSearchParams();
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeRow(b: NoticeCategoryBackendRow): NoticeCategoryRow {
  return {
    categoryId: b.categoryId,
    name: b.name,
    postCount: b.postCount,
    bgColor: b.bgColorHex,
    textColor: b.textColorHex,
    lastCreatedAt: b.createdAt,
  };
}

function normalizeList(payload: NoticeCategoryListResponseDto): NoticeCategoryRow[] {
  let arr: NoticeCategoryBackendRow[] = [];

  if (Array.isArray(payload)) {
    arr = payload;
  } else if (payload && typeof payload === "object") {
    if (Array.isArray((payload as any).items)) arr = (payload as any).items;
    else if (Array.isArray((payload as any).data)) arr = (payload as any).data; // ✅ 현재 너의 응답 형태
  }

  return arr.map(normalizeRow);
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
