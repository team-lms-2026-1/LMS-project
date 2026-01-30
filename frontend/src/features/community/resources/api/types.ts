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
export type ResourceListItemDto={
    resourceId : number;
    category : Category;
    title : string;
    content : string;
    authorName : string;
    viewCount : number;
    createdAt : string;
    files : []
}

export type CreateResourceRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
  displayStartAt?: string | null;
  displayEndAt?: string | null;
};

// ✅ 수정 요청 DTO (Create와 동일 구조면 재사용 가능)
export type UpdateResourceRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
};

// ✅ 수정 응답 (백엔드가 success만 주면 SuccessResponse 쓰면 됨)
export type UpdateResourceResponse = ApiResponse<{ resourceId: number }, null>;

/** Response */
export type ResourceListResponse = ApiResponse<ResourceListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

export type CreateResourceResponseDto = {
  resourceId: number;
};
export type CreateResourceResponse = ApiResponse<CreateResourceResponseDto, null>;

export type ResourceCategoryListResponse = ApiResponse<Category[], null>;
