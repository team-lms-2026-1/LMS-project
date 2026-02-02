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

export type FileType = "IMAGE" | "DOCUMENT" | "VIDEO" | "ETC" | string;

export type QnaStatus = "SCHEDULED" | "ONGOING" | "ENDED" | string;

export type SearchType = "TITLE" | "CONTENT" | "TITLE_OR_CONTENT" | "WRITER" | string;

export type Category = {
  categoryId : number;
  name : string;
  bgColorHex : string;
  textColorHex : string;
}

/** DTO */
export type QnaListItemDto={
    questionId : number;
    category : Category | null;
    title : string;
    content : string;
    authorName : string;
    viewCount : number;
    createdAt : string;
    hasAnswer : boolean;
}

type MeDto = { loginId: string };

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
  category: Category;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
  hasAnswer: boolean;
};

export type CreateQnaQuestionResponseDto = {
  questionId: number;
};
export type CreateQnaQuestionResponse = ApiResponse<CreateQnaQuestionResponseDto, null>;

/** Response */
export type QnaListResponse = ApiResponse<QnaListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;
export type QnaDetailResponse = ApiResponse<QnaDetailDto, null>;

export type QnaCategoryListResponse = ApiResponse<Category[], null>;