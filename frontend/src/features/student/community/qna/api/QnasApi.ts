import { getJson } from "@/lib/http";
import type {
  QnaListResponse,
  QnaDetailResponse,
  CreateQnaQuestionRequestDto,
  CreateQnaQuestionResponse,
  QnaCategoryListResponse,
  MeResponse,
  SuccessResponse,
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

/**
 * ✅ getJson이 GET 전용이라서 POST/DELETE용 공통 유틸을 둠
 * - credentials 포함 (쿠키 기반이면 필수)
 * - content-type 기본 지정 옵션
 */
async function requestJson<T>(
  url: string,
  init: RequestInit,
  failMessage: string,
  fallback: T
): Promise<T> {
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

/** ✅ 질문 목록 */
export async function fetchQnaList(query: QnaListQuery) {
  return getJson<QnaListResponse>(`/api/student/community/qna/questions${toQuery(query)}`);
}

/** ✅ 질문 상세 */
export async function fetchQnaDetail(questionId: number) {
  return getJson<QnaDetailResponse>(`/api/student/community/qna/questions/${questionId}`);
}

/** ✅ 카테고리 목록 */
export async function fetchQnaCategories() {
  return getJson<QnaCategoryListResponse>(`/api/student/community/qna/categories`);
}

/** ✅ 질문 등록 */
export async function createQnaQuestion(body: CreateQnaQuestionRequestDto) {
  const fallback: CreateQnaQuestionResponse = { data: { questionId: 0 }, meta: null };

  return requestJson(
    `/api/student/community/qna/questions/new`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    "질문 등록 실패",
    fallback
  );
}

/** ✅ 질문 삭제 */
export async function deleteQnaQuestion(questionId: number) {
  const fallback: SuccessResponse = { data: { success: true }, meta: null };

  await requestJson(
    `/api/student/community/qna/questions/${questionId}`,
    { method: "DELETE" },
    "삭제 실패",
    fallback
  );

  return true;
}

/** ✅ 내 정보 (AuthProvider에서 이미 들고 있으면 이 함수는 선택) */
export async function fetchMe() {
  // NOTE: 실제 프로젝트 엔드포인트가 /api/student/me 라면 여기만 바꾸면 됨
  return getJson<MeResponse>(`/api/student/mypage`);
}
