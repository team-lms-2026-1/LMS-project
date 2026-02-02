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
};

export async function fetchResourcesList(query: ResourcesListQuery) {
  const sp = new URLSearchParams();
  if (typeof query.page === "number") sp.set("page", String(query.page));
  if (typeof query.size === "number") sp.set("size", String(query.size));
  if (query.keyword?.trim()) sp.set("keyword", query.keyword.trim());

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

  // ✅ notice와 동일하게 /new로 통일
  const res = await fetch(`/api/admin/community/resources/new`, {
    method: "POST",
    body: fd,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `요청 실패 (${res.status})`;
    try {
      // notice처럼 text 우선
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

/** ✅ 수정: (1) files 또는 deleteFileIds 있으면 multipart(form-data)
 *  - request(JSON) 안에도 deleteFileIds 포함
 *  - FormData 필드로도 deleteFileIds append (백엔드 바인딩 방식 다양성 대비)
 *  (2) 둘 다 없으면 JSON로 PATCH 가능 (백엔드가 JSON도 지원한다면)
 */
export async function updateResource(
  resourceId: number,
  body: UpdateResourceRequestDto,
  files?: File[]
) {
  const deleteIds = body.deleteFileIds ?? [];
  const hasFiles = (files?.length ?? 0) > 0;
  const hasDeletes = deleteIds.length > 0;

  const useMultipart = hasFiles || hasDeletes;

  if (useMultipart) {
    const fd = new FormData();

    // ✅ request JSON 안에 deleteFileIds 포함
    const requestPayload = {
      title: body.title,
      content: body.content,
      categoryId: body.categoryId,
      deleteFileIds: deleteIds,
    };

    fd.append("request", new Blob([JSON.stringify(requestPayload)], { type: "application/json" }));

    // ✅ FormData 필드로도 반복 append
    for (const id of deleteIds) fd.append("deleteFileIds", String(id));

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

  // ✅ 변경(삭제/파일) 없으면 JSON (백엔드가 JSON PATCH 지원할 때만 의미 있음)
  const res = await fetch(`/api/admin/community/resources/${resourceId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: body.title,
      content: body.content,
      categoryId: body.categoryId,
    }),
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
