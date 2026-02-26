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
  categoryId?: number;
};

export async function fetchNoticesList(query: NoticesListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
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

async function readJsonMaybe(res: Response): Promise<any | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractIdFromLocation(res: Response): number | null {
  const loc = res.headers.get("location") || res.headers.get("content-location");
  if (!loc) return null;
  const m = loc.match(/(\d+)(?:\D*)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function normalizeNoticeEnvelope(payload: any, fallbackId: number) {
  if (payload && typeof payload === "object") {
    if ("data" in payload) return payload;
    if (typeof payload.noticeId === "number") return { data: { noticeId: payload.noticeId }, meta: payload.meta ?? null };
    if (typeof payload.id === "number") return { data: { noticeId: payload.id }, meta: payload.meta ?? null };
  }
  if (typeof payload === "number") return { data: { noticeId: payload }, meta: null };
  return { data: { noticeId: fallbackId }, meta: null };
}

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

  const payload = await readJsonMaybe(res);
  const idFromLoc = extractIdFromLocation(res) ?? 0;
  return normalizeNoticeEnvelope(payload, idFromLoc) as CreateNoticeResponse;
}

export async function updateNotice(noticeId: number, body: UpdateNoticeRequestDto, files?: File[]) {
  const deleteIds = body.deleteFileIds ?? [];

  const displayStartAt = body.displayStartAt || null;
  const displayEndAt = body.displayEndAt || null;

  // ✅ 백엔드가 기대하는 엔벨로프: { data, meta }
  const dataPayload = {
    title: body.title,
    content: body.content,
    categoryId: body.categoryId ?? null,
    displayStartAt,
    displayEndAt,
    deleteFileIds: deleteIds,
  };
  const requestPayload = { data: dataPayload, meta: null, ...dataPayload };


  // ✅ 파일 유무와 관계없이 항상 multipart로 통일
  const fd = new FormData();
  fd.append("request", new Blob([JSON.stringify(requestPayload)], { type: "application/json" }));

  // ✅ files는 있을 때만 append (없어도 정상)
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

  const payload = await readJsonMaybe(res);
  return normalizeNoticeEnvelope(payload, noticeId) as UpdateNoticeResponse;
}
