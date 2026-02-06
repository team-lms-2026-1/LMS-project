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
  export type NoticeListItemDto = {
    noticeId: number;
    category: Category; 
    title: string;
    content: string;
    authorName: string;
    viewCount: number;
    createdAt: string;
    status: string;
    files: any[]; 
    displayStartAt?: string | null;
    displayEndAt?: string | null;
  };

  export type NoticeDetailDto = NoticeListItemDto & {
    displayStartAt?: string | null;
    displayEndAt?: string | null;
  };

  export type CreateNoticeRequestDto = {
    title: string;
    content: string;
    categoryId?: number;
    displayStartAt?: string | null;
    displayEndAt?: string | null;
  };

  export type UpdateNoticeRequestDto = {
    title: string;
    content: string;
    categoryId?: number;
    deleteFileIds?: number[];
    displayStartAt?: string | null;
    displayEndAt?: string | null;
  };

  export type NoticeFileDto = {
    fileId?: number;
    id?: number; 
    storageKey?: string;
    fileName?: string;
    originalName?: string;
    name?: string;
    url?: string;
    downloadUrl?: string;
    fileType?: FileType;
    size?: number;
  };

  export type ExistingFile = {
    attachmentId?: number;
    storageKey?: string;
    fileName: string;
    url?: string;
  };

  type ExistingAttachment = {
    attachmentId?: number;
    fileName: string;
    url?: string;
  };

  export type UpdateNoticeResponse = ApiResponse<{ noticeId: number }, null>;

  /** Response */
  export type NoticeListResponse = ApiResponse<NoticeListItemDto[], PageMeta>;
  export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

  export type CreateNoticeResponseDto = { noticeId: number };
  export type CreateNoticeResponse = ApiResponse<CreateNoticeResponseDto, null>;

  export type NoticeCategoryListResponse = ApiResponse<Category[], null>;
