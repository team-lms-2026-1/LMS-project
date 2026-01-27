import { getJson } from "@/lib/http";
import type { CategoryApi, CategoryRow } from "@/features/community/components/categoryManager/types";
import type {
  FaqCategoryListParams,
  FaqCategoryListResponseDto,
  CreateFaqCategoryRequestDto,
  UpdateFaqCategoryRequestDto,
  FaqCategoryBackendRow,
} from "./dto";

const BASE = "/api/admin/community/faqs/categories";

function toQuery(params: FaqCategoryListParams) {
  const sp = new URLSearchParams();
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeRow(b: FaqCategoryBackendRow): CategoryRow {
  return {
    categoryId: b.categoryId,
    name: b.name,
    postCount: b.postCount ?? 0,
    bgColor: b.bgColorHex,
    textColor: b.textColorHex,
    lastCreatedAt: b.createdAt ?? "",
  };
}

function normalizeList(payload: FaqCategoryListResponseDto): CategoryRow[] {
  let arr: FaqCategoryBackendRow[] = [];

  if (Array.isArray(payload)) {
    arr = payload;
  } else if (payload && typeof payload === "object") {
    if (Array.isArray((payload as any).items)) arr = (payload as any).items;
    else if (Array.isArray((payload as any).data)) arr = (payload as any).data;
  }

  return arr.map(normalizeRow);
}

export const faqCategoriesApi: CategoryApi = {
  async list(params) {
    const payload = await getJson<FaqCategoryListResponseDto>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },

  async create(body) {
    const req = body as CreateFaqCategoryRequestDto;
    return getJson(`${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  },

  async update(categoryId, body) {
    const req = body as UpdateFaqCategoryRequestDto;
    return getJson(`${BASE}/${encodeURIComponent(categoryId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  },

  async remove(categoryId) {
    return getJson(`${BASE}/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
  },
};
