import { getJson } from "@/lib/http";
import type {
  CreateQnaQuestionRequestDto,
  CreateQnaQuestionResponse,
  MeResponse,
  QnaCategoryListResponse,
  QnaDetailResponse,
  QnaListResponse,
  SuccessResponse,
  UpdateQnaQuestionRequestDto,
} from "./types";

export type QnaListQuery = { page?: number; size?: number; keyword?: string };

function toQuery(query: QnaListQuery) {
  const sp = new URLSearchParams();
  if (typeof query.page === "number") sp.set("page", String(query.page));
  if (typeof query.size === "number") sp.set("size", String(query.size));
  if (query.keyword?.trim()) sp.set("keyword", query.keyword.trim());
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function requestJson<T>(url: string, init: RequestInit, failMessage: string, fallback: T): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...init,
  });

  if (!res.ok) {
    let msg = `${failMessage} (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchQnaList(query: QnaListQuery) {
  return getJson<QnaListResponse>(`/api/student/community/qna/questions${toQuery(query)}`);
}

export async function fetchQnaDetail(questionId: number) {
  return getJson<QnaDetailResponse>(`/api/student/community/qna/questions/${questionId}`);
}

export async function fetchQnaCategories() {
  return getJson<QnaCategoryListResponse>(`/api/student/community/qna/categories`);
}

export async function createQnaQuestion(body: CreateQnaQuestionRequestDto) {
  const fallback: CreateQnaQuestionResponse = { data: { questionId: 0 }, meta: null };

  return requestJson(
    `/api/student/community/qna/questions/new`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "Create question failed",
    fallback
  );
}

export async function deleteQnaQuestion(questionId: number) {
  const fallback: SuccessResponse = { data: { success: true }, meta: null };

  await requestJson(`/api/student/community/qna/questions/${questionId}`, { method: "DELETE" }, "Delete failed", fallback);
  return true;
}

export async function fetchMe() {
  return getJson<MeResponse>(`/api/student/mypage`);
}

export async function updateQnaQuestion(questionId: number, body: UpdateQnaQuestionRequestDto) {
  const res = await fetch(`/api/student/community/qna/questions/${questionId}/edit`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Update failed (${res.status})`);
  }

  return true;
}
