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

  export type HexColor = `#${string}`;

  export type Category = {
    categoryId: number;
    name: string;
    bgColorHex: HexColor;
    textColorHex: HexColor;
  };

/** DTO */
export type ResourceListItemDto={
    resourceId : number;
    category : Category;
    title : string;
    content : string;
    authorName : string;
    viewCount : number;
    createdAt : string;
    files : any[]
}

export type CreateResourceRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
  displayStartAt?: string | null;
  displayEndAt?: string | null;
};

export type UpdateResourceRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
  deleteFileIds?: number[];
};

export type ResourceFileDto = {
  // 삭제 식별자 후보 (백엔드가 둘 중 하나라도 내려줘야 삭제 가능)
  fileId?: number;
  id?: number; // 일부 백엔드가 id로 주는 경우 대비
  storageKey?: string;

  // 표시용 이름 후보
  fileName?: string;
  originalName?: string;
  name?: string;

  // 링크 후보
  url?: string;
  downloadUrl?: string;

  // 부가 메타(있으면 활용)
  fileType?: FileType;
  size?: number;
};

export type ExistingFile = {
  fileId?: number;
  storageKey?: string;
  fileName: string;
  url?: string;
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
