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

/** DTO */
export type NoticeListItemDto={
    noticeId : number;
    categoryName : string;
    title : string;
    content : string;
    authorName : string;
    viewCount : number;
    createAt : string;
    status : string;
    files : []
}

/** Response */
export type NoticeListResponse = ApiResponse<NoticeListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;