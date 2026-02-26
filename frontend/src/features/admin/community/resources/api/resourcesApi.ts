import { getJson } from "@/lib/http";
import type {
  ResourceListResponse,
  ResourceCategoryListResponse,
  CreateResourceRequestDto,
  CreateResourceResponse,
  UpdateResourceRequestDto,
  UpdateResourceResponse,
} from "./types";

export type ResourcesListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
};

type ApiEnvelope<T> = { data: T; meta: any } | { data: T; meta: null }; 

async function parseEnvelopeOrFallback<T>(
  res: Response,
  fallbackData: T
): Promise<{ data: T; meta: any | null }> {
  try {
    const text = await res.text();
    if (!text) return { data: fallbackData, meta: null };
    const json = JSON.parse(text);
    if (json && typeof json === "object" && "data" in json) {
      return { data: json.data as T, meta: (json as any).meta ?? null };
    }
    return { data: json as T, meta: null };
  } catch {
    return { data: fallbackData, meta: null };
  }
}

async function assertOk(res: Response) {
  if (res.ok) return;
  let msg = `Request failed (${res.status})`;
  try {
    const text = await res.text();
    if (text) msg = text;
  } catch {}
  throw new Error(msg);
}

export async function fetchResourcesList(query: ResourcesListQuery) {
  const sp = new URLSearchParams();
  if (typeof query.page === "number") sp.set("page", String(query.page));
  if (typeof query.size === "number") sp.set("size", String(query.size));
  if (query.keyword?.trim()) sp.set("keyword", query.keyword.trim());
  if (typeof query.categoryId === "number") sp.set("categoryId", String(query.categoryId));

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

export async function createResource(body: CreateResourceRequestDto, files?: File[]) {
  const fd = new FormData();
  fd.append("request", new Blob([JSON.stringify(body)], { type: "application/json" }));
  (files ?? []).forEach((f) => fd.append("files", f));

  const res = await fetch(`/api/admin/community/resources/new`, {
    method: "POST",
    body: fd,
    cache: "no-store",
  });

  await assertOk(res);

  return parseEnvelopeOrFallback<CreateResourceResponse["data"]>(
    res,
    { resourceId: 0 } as CreateResourceResponse["data"]
  ).then((env) => ({ data: env.data, meta: env.meta } as CreateResourceResponse));
}

export async function updateResource(
  resourceId: number,
  body: UpdateResourceRequestDto,
  files?: File[]
) {
  const deleteIds = body.deleteFileIds ?? [];

  const requestPayload = {
    title: body.title,
    content: body.content,
    categoryId: body.categoryId,
    deleteFileIds: deleteIds,
  };

  const fd = new FormData();

  fd.append(
    "request",
    new Blob([JSON.stringify(requestPayload)], { type: "application/json" })
  );

  for (const id of deleteIds) fd.append("deleteFileIds", String(id));

  (files ?? []).forEach((f) => fd.append("files", f));

  const res = await fetch(`/api/admin/community/resources/${resourceId}`, {
    method: "PATCH",
    body: fd,
    cache: "no-store",
  });

  await assertOk(res);

  return parseEnvelopeOrFallback<UpdateResourceResponse["data"]>(
    res,
    { resourceId } as UpdateResourceResponse["data"]
  ).then((env) => ({ data: env.data, meta: env.meta } as UpdateResourceResponse));
}
