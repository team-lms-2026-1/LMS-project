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

export type NoticeStatus = "SCHEDULED" | "ONGOING" | "ENDED" | string;

export type SearchType = "TITLE" | "CONTENT" | "TITLE_OR_CONTENT" | "WRITER" | string;

export type Category = {
  categoryId : number;
  name : string;
  bgColorHex : string;
  textColorHex : string;
}

/** DTO */
export type FaqListItemDto={
    faqId : number;
    category : Category;
    title : string;
    content : string;
    authorName : string;
    viewCount : number;
    createdAt : string;
    status : string;
}

export type CreateFaqRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
  displayStartAt?: string | null;
  displayEndAt?: string | null;
};

// ✅ 수정 요청 DTO (Create와 동일 구조면 재사용 가능)
export type UpdateFaqRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
};

// ✅ 수정 응답 (백엔드가 success만 주면 SuccessResponse 쓰면 됨)
export type UpdateFaqResponse = ApiResponse<{ faqId: number }, null>;

/** Response */
export type FaqListResponse = ApiResponse<FaqListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

export type CreateFaqResponseDto = {
  faqId: number;
};
export type CreateFaqResponse = ApiResponse<CreateFaqResponseDto, null>;

export type FaqCategoryListResponse = ApiResponse<Category[], null>;
