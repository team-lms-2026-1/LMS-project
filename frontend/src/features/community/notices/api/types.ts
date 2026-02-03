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
  };

  export type NoticeFileDto = {
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
