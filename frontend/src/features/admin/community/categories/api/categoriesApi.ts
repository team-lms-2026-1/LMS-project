// src/features/community/categories/api/CategoriesApi.ts
import { getJson } from "@/lib/http";
import type {
  ApiErrorResponse,
  Category,
  CategoryListQuery,
  CategoryListResponse,
  CategoryScope,
  CreateCategoryRequestDto,
  CreateCategoryResponseDto,
  UpdateCategoryRequestDto,
  UpdateCategoryResponseDto,
} from "./types";

function basePath(scope: CategoryScope) {
  return `/api/admin/community/${scope}/categories`;
}

function toQuery(params?: CategoryListQuery) {
  const sp = new URLSearchParams();
  if (!params) return "";

  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function unwrapError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ApiErrorResponse;
    const msg = data?.error?.message;
    if (msg) return msg;
  } catch {}
  try {
    const text = await res.text();
    if (text) return text;
  } catch {}
  return `요청 실패 (${res.status})`;
}

export const categoriesApi = {
  /** 카테고리 목록 */
  async list(scope: CategoryScope, query?: CategoryListQuery) {
    const url = `${basePath(scope)}${toQuery(query)}`;
    return getJson<CategoryListResponse>(url);
  },

  /** 카테고리 단건(필요하면 사용) */
  async get(scope: CategoryScope, categoryId: number) {
    const url = `${basePath(scope)}/${encodeURIComponent(String(categoryId))}`;
    return getJson<{ data: Category }>(url);
  },

  /** 카테고리 생성 */
  async create(scope: CategoryScope, body: CreateCategoryRequestDto) {
    const res = await fetch(basePath(scope), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(await unwrapError(res));
    return (await res.json()) as CreateCategoryResponseDto;
  },

  /** 카테고리 수정 */
  async update(scope: CategoryScope, categoryId: number, body: UpdateCategoryRequestDto) {
    const url = `${basePath(scope)}/${encodeURIComponent(String(categoryId))}`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(await unwrapError(res));
    return (await res.json()) as UpdateCategoryResponseDto;
  },

  /** 카테고리 삭제 */
  async remove(scope: CategoryScope, categoryId: number) {
    const url = `${basePath(scope)}/${encodeURIComponent(String(categoryId))}`;

    const res = await fetch(url, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res.ok) throw new Error(await unwrapError(res));
    return true;
  },
};
