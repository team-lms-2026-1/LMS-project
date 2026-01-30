import { getJson } from "@/lib/http";
import type {
  ResourceListResponse,
  ResourceCategoryListResponse,
  CreateResourceRequestDto,
  CreateResourceResponse,
  UpdateResourceRequestDto,
  UpdateResourceResponse,
} from "./types";

export type NotiesListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchResourcesList(query: NotiesListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/admin/community/resources?${qs}` : `/api/admin/community/resources`;

  return getJson<ResourceListResponse>(url);
}

export async function fetchResourceDetail(resourceId: number) {
  return getJson<any>(`/api/admin/community/resources/${resourceId}`);
}

export async function fetchResourceCategories() {
  return getJson<ResourceCategoryListResponse>(`/api/admin/community/resources/categories`);
}

/** ✅ 등록: multipart(form-data) */
export async function createResource(body: CreateResourceRequestDto, files?: File[]) {
  const fd = new FormData();
  fd.append("request", new Blob([JSON.stringify(body)], { type: "application/json" }));
  (files ?? []).forEach((f) => fd.append("files", f));

  const res = await fetch(`/api/admin/community/resources/new`, {
    method: "POST",
    body: fd,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `요청 실패 (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  try {
    return (await res.json()) as CreateResourceResponse;
  } catch {
    return { data: { resourceId: 0 }, meta: null } as any;
  }
}

/** ✅ 수정: multipart(form-data) (request + files) */
export async function updateResource(resourceId: number, body: UpdateResourceRequestDto, files?: File[]) {
  const fd = new FormData();
  fd.append("request", new Blob([JSON.stringify(body)], { type: "application/json" }));
  (files ?? []).forEach((f) => fd.append("files", f));

  const res = await fetch(`/api/admin/community/resources/${resourceId}`, {
    method: "PATCH",
    body: fd,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `요청 실패 (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  try {
    return (await res.json()) as UpdateResourceResponse;
  } catch {
    return { data: { resourceId }, meta: null } as any;
  }
}

/** ✅ 삭제 */
export async function deleteResource(resourceId: number) {
  const res = await fetch(`/api/admin/community/resources/${resourceId}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `요청 실패 (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  return true;
}
