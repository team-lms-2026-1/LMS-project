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

export type Category = {
  categoryId: number;
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

/** ✅ 공통: 작성자 식별자(백엔드가 주면 사용) */
export type AuthorIdentity = {
  authorId?: number | null;        // accountId 같은 숫자
  authorLoginId?: string | null;   // loginId 같은 문자열
};

/** ✅ 목록 DTO */
export type QnaListItemDto = {
  questionId: number;
  category: Category | null;
  title: string;
  content: string;

  authorName: string;

  // ✅ 본인 글 판별용(백엔드가 주면 사용)
  authorId?: number | null;
  authorLoginId?: string | null;

  viewCount: number;
  createdAt: string;
  hasAnswer: boolean;
};

/** ✅ Me */
export type MeDto = {
  // 최소: 본인 판별에 필요한 값
  loginId: string;

  // (있으면 더 좋음)
  accountId?: number;
  accountType?: string;
  permissionCodes?: string[];
};

export type MeResponse = ApiResponse<MeDto, null>;

/** Create DTO */
export type CreateQnaQuestionRequestDto = {
  title: string;
  content: string;
  categoryId?: number | null;
};

/** Detail DTO */
export type QnaDetailDto = {
  questionId: number;
  category: Category | null;
  title: string;
  content: string;

  authorName: string;

  // ✅ 본인 글 판별용(백엔드가 주면 사용)
  authorId?: number | null;
  authorLoginId?: string | null;

  viewCount: number;
  createdAt: string;
  hasAnswer: boolean;
};

export type UpdateQnaQuestionRequestDto = {
  title: string;
  content: string;
  categoryId?: number | null;
};

export type UpdateQnaQuestionResponseDto = { questionId: number };
export type UpdateQnaQuestionResponse = ApiResponse<UpdateQnaQuestionResponseDto, null>;

export type CreateQnaQuestionResponseDto = { questionId: number };
export type CreateQnaQuestionResponse = ApiResponse<CreateQnaQuestionResponseDto, null>;

export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

export type QnaListResponse = ApiResponse<QnaListItemDto[], PageMeta>;
export type QnaDetailResponse = ApiResponse<QnaDetailDto, null>;
export type QnaCategoryListResponse = ApiResponse<Category[], null>;
