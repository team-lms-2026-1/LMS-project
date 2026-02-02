import { getJson } from "@/lib/http";
import type {
  NoticeListResponse,
  NoticeCategoryListResponse,
  CreateNoticeRequestDto,
  CreateNoticeResponse,
  UpdateNoticeRequestDto,
  UpdateNoticeResponse,
} from "./types";

export type NotiesListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchNoticesList(query: NotiesListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

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

/** ✅ 수정: multipart(form-data) (request + files) */
export async function updateNotice(noticeId: number, body: UpdateNoticeRequestDto, files?: File[]) {
  const fd = new FormData();
  fd.append("request", new Blob([JSON.stringify(body)], { type: "application/json" }));
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

/** ✅ 삭제 */
export async function deleteNotice(noticeId: number) {
  const res = await fetch(`/api/admin/community/notices/${noticeId}`, {
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
