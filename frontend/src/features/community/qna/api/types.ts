// src/features/community/qna/api/types.ts (ADMIN)

export type ApiResponse<T, M = null> = {
  data: T;
  meta: M;
};

export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

export type QnaStatus = "SCHEDULED" | "ONGOING" | "ENDED" | string;
export type SearchType = "TITLE" | "CONTENT" | "TITLE_OR_CONTENT" | "WRITER" | string;

export type Category = {
  categoryId: number;
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

/* =========================
 *  답변(Answer) - 상세에 포함
 * ========================= */

export type QnaAnswerDto = {
  answerId: number;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
};

/* =========================
 *  질문(Question)
 * ========================= */

export type QnaListItemDto = {
  questionId: number;
  category: Category | null;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
  hasAnswer: boolean;
  status?: QnaStatus;
};

/** ✅ 상세 DTO: answer 단일 */
export type QnaDetailDto = {
  questionId: number;
  category: Category | null;
  title: string;
  content: string;
  viewCount: number;
  authorName: string;
  authorId?: number;
  createdAt: string;

  /** ✅ 백엔드 응답: answer 객체 */
  answer: QnaAnswerDto | null;

  /** ✅ 백엔드가 내려주면 사용 */
  hasAnswer?: boolean;

  status?: QnaStatus;
};

/* =========================
 *  Responses
 * ========================= */

export type QnaListResponse = ApiResponse<QnaListItemDto[], PageMeta>;
export type QnaDetailResponse = ApiResponse<QnaDetailDto, null>;
export type QnaCategoryListResponse = ApiResponse<Category[], null>;

export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

export type DeleteQnaQuestionResponse = SuccessResponse;

/** ✅ 답변 등록/수정/삭제 응답이 전부 success */
export type AnswerWriteResponse = SuccessResponse;

/* =========================
 *  Requests
 * ========================= */

export type CreateQnaAnswerRequestDto = {
  content: string;
};
