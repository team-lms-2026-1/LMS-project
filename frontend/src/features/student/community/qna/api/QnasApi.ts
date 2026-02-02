import { getJson } from "@/lib/http";
import type {
  QnaListResponse,
  QnaDetailResponse,
  CreateQnaQuestionRequestDto,
  CreateQnaQuestionResponse,
  QnaCategoryListResponse,
  MeResponse
} from "./types";

export type QnaListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchQnaList(query: QnaListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/student/community/qna/questions?${qs}` : `/api/student/community/qna/questions`;

  return getJson<QnaListResponse>(url);
}

export async function fetchQnaDetail(questionId: number) {
  return getJson<QnaDetailResponse>(`/api/student/community/qna/questions/${questionId}`);
}

/** ✅ 카테고리 목록 */
export async function fetchQnaCategories() {
  // 너가 BFF route를 만들면 이 URL이 살아야 함:
  // src/app/api/student/community/qna/categories/route.ts  (GET)
  return getJson<QnaCategoryListResponse>(`/api/student/community/qna/categories`);
}

/** ✅ 질문 등록 (getJson이 GET 전용일 때) */
export async function createQnaQuestion(body: CreateQnaQuestionRequestDto) {
  const res = await fetch(`/api/student/community/qna/questions/new`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
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
    return (await res.json()) as CreateQnaQuestionResponse;
  } catch {
    return { data: { questionId: 0 }, meta: null } as any;
  }
}

export async function deleteQnaQuestion(questionId: number) {
  const res = await fetch(`/api/student/community/qna/questions/${questionId}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `삭제 실패 (${res.status})`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  return true;
}

export async function fetchMe() {
  return getJson<MeResponse>(`/api/student/mypage`);
}
