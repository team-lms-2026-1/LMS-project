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

export type FilteType = "IMAGE" | "DOCUMENT" | "VIDEO" | "ETC" | string;

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
    createAt : string;
    files : []
}

/** Response */
export type ResourceListResponse = ApiResponse<ResourceListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;