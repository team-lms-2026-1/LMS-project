import { getJson } from "@/lib/http";
import type {
  QnaListResponse,
  QnaDetailResponse,
  QnaCategoryListResponse,
  CreateQnaAnswerRequestDto,
  AnswerWriteResponse,
  DeleteQnaQuestionResponse,
} from "./types";

export type QnaListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
};

function toQuery(query: QnaListQuery) {
  const sp = new URLSearchParams();
  if (typeof query.page === "number") sp.set("page", String(query.page));
  if (typeof query.size === "number") sp.set("size", String(query.size));
  if (query.keyword?.trim()) sp.set("keyword", query.keyword.trim());

  // ✅ 추가: categoryId
  if (typeof query.categoryId === "number") sp.set("categoryId", String(query.categoryId));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function requestJson<T>(
  url: string,
  init: RequestInit,
  failMessage: string,
  fallback: T
): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      ...(init.headers ?? {}),
    },
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

/** ✅ 질문 목록 */
export async function fetchQnaList(query: QnaListQuery) {
  return getJson<QnaListResponse>(`/api/admin/community/qna/questions${toQuery(query)}`);
}

/** ✅ 질문 상세 (answer 포함) */
export async function fetchQnaDetail(questionId: number) {
  return getJson<QnaDetailResponse>(`/api/admin/community/qna/questions/${questionId}`);
}

/** ✅ 카테고리 목록 */
export async function fetchQnaCategories() {
  return getJson<QnaCategoryListResponse>(`/api/admin/community/qna/categories`);
}

/** ✅ 질문 삭제 */
export async function deleteQnaQuestion(questionId: number) {
  const fallback: DeleteQnaQuestionResponse = { data: { success: true }, meta: null };
  return requestJson(
    `/api/admin/community/qna/questions/${questionId}`,
    { method: "DELETE" },
    "삭제 실패",
    fallback
  );
}

/* =========================
 * 답변 (answerId 없이 questionId로만)
 * ========================= */

export async function createQnaAnswer(questionId: number, body: CreateQnaAnswerRequestDto) {
  const fallback: AnswerWriteResponse = { data: { success: true }, meta: null };
  return requestJson(
    `/api/admin/community/qna/questions/${questionId}/answers`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
    "답변 등록 실패",
    fallback
  );
}

export async function updateQnaAnswer(questionId: number, body: CreateQnaAnswerRequestDto) {
  const fallback: AnswerWriteResponse = { data: { success: true }, meta: null };
  return requestJson(
    `/api/admin/community/qna/questions/${questionId}/answers`,
    { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
    "답변 수정 실패",
    fallback
  );
}

export async function deleteQnaAnswer(questionId: number) {
  const fallback: AnswerWriteResponse = { data: { success: true }, meta: null };
  return requestJson(
    `/api/admin/community/qna/questions/${questionId}/answers`,
    { method: "DELETE" },
    "답변 삭제 실패",
    fallback
  );
}
