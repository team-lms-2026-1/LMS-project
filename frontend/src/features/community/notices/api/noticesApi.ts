import { getJson } from "@/lib/http";
import type {
  NoticeListResponse,
  NoticeCategoryListResponse,
  CreateNoticeRequestDto,
  CreateNoticeResponse,
  UpdateNoticeRequestDto,
  UpdateNoticeResponse,
} from "./types";

export type NoticesListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number; // ✅ 추가
};

export async function fetchNoticesList(query: NoticesListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  // ✅ 추가: categoryId
  if (typeof query.categoryId === "number") sp.set("categoryId", String(query.categoryId));

  const qs = sp.toString();
  const url = qs ? `/api/admin/community/notices?${qs}` : `/api/admin/community/notices`;

  return getJson<NoticeListResponse>(url);
}

export async function fetchNoticeDetail(noticeId: number) {
  return getJson<any>(`/api/admin/community/notices/${noticeId}`);
}

export async function fetchNoticeCategories() {
  return getJson<NoticeCategoryListResponse>(`/api/admin/community/notices/categories`);
}

/** ✅ 등록: multipart(form-data) */
export async function createNotice(body: CreateNoticeRequestDto, files?: File[]) {
  const fd = new FormData();
  fd.append("request", new Blob([JSON.stringify(body)], { type: "application/json" }));
  (files ?? []).forEach((f) => fd.append("files", f));

  const res = await fetch(`/api/admin/community/notices/new`, {
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
    return (await res.json()) as CreateNoticeResponse;
  } catch {
    return { data: { noticeId: 0 }, meta: null } as any;
  }
}

/** ✅ 수정: (1) 파일 변경 있으면 multipart(form-data), (2) 없으면 application/json */
export async function updateNotice(
  noticeId: number,
  body: UpdateNoticeRequestDto,
  files?: File[]
) {
  const deleteIds = body.deleteFileIds ?? [];
  const hasFiles = (files?.length ?? 0) > 0;
  const hasDeletes = deleteIds.length > 0;
  const useMultipart = hasFiles || hasDeletes;

  if (useMultipart) {
    const fd = new FormData();

    const requestPayload = {
      title: body.title,
      content: body.content,
      categoryId: body.categoryId,
      deleteFileIds: deleteIds,
    };

    fd.append("request", new Blob([JSON.stringify(requestPayload)], { type: "application/json" }));

    for (const id of deleteIds) fd.append("deleteFileIds", String(id));
    (files ?? []).forEach((f) => fd.append("files", f));

    const res = await fetch(`/api/admin/community/notices/${noticeId}`, {
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
      return (await res.json()) as UpdateNoticeResponse;
    } catch {
      return { data: { noticeId }, meta: null } as any;
    }
  }

  const res = await fetch(`/api/admin/community/notices/${noticeId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: body.title,
      content: body.content,
      categoryId: body.categoryId,
      deleteFileIds: body.deleteFileIds ?? [],
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
    return (await res.json()) as UpdateNoticeResponse;
  } catch {
    return { data: { noticeId }, meta: null } as any;
  }
}
