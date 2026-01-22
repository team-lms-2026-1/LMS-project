import { getJson } from "@/lib/http";
import type { CategoryRow, CategoryListParams } from "@/features/community/types/category";

const BASE = "/api/admin/community/resource-categories";

function toQuery(params: CategoryListParams) {
  const sp = new URLSearchParams();
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeList(payload: any): CategoryRow[] {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export const resourceCategoriesApi = {
  async list(params: CategoryListParams) {
    const payload = await getJson<any>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },
  create(body: { name: string; bgColor: string; textColor: string }) {
    return getJson(`${BASE}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  },
  update(id: string, body: { name: string; bgColor: string; textColor: string }) {
    return getJson(`${BASE}/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  },
  remove(id: string) {
    return getJson(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
