import { getJson } from "@/lib/http";
import type {
  FaqListResponse,
  FaqCategoryListResponse,
  CreateFaqRequestDto,
  CreateFaqResponse,
  UpdateFaqRequestDto,
  UpdateFaqResponse,
} from "./types";

export type NotiesListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
};

export async function fetchFaqsList(query: NotiesListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  // ✅ 추가: categoryId
  if (typeof query.categoryId === "number") sp.set("categoryId", String(query.categoryId));

  const qs = sp.toString();
  const url = qs ? `/api/admin/community/faqs?${qs}` : `/api/admin/community/faqs`;

  return getJson<FaqListResponse>(url);
}

export async function fetchFaqDetail(faqId: number) {
  return getJson<any>(`/api/admin/community/faqs/${faqId}`);
}

export async function fetchFaqCategories() {
  return getJson<FaqCategoryListResponse>(`/api/admin/community/faqs/categories`);
}

/** ✅ 등록 */
export async function createFaq(body: CreateFaqRequestDto) {
  const res = await fetch(`/api/admin/community/faqs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  try {
    return (await res.json()) as CreateFaqResponse;
  } catch {
    return { data: { faqId: 0 }, meta: null } as any;
  }
}

/** ✅ 수정 */
export async function updateFaq(faqId: number, body: UpdateFaqRequestDto) {
  const res = await fetch(`/api/admin/community/faqs/${faqId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  return (await res.json()) as UpdateFaqResponse;
}

/** ✅ 삭제 */
export async function deleteFaq(faqId: number) {
  const res = await fetch(`/api/admin/community/faqs/${faqId}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  return true;
}
