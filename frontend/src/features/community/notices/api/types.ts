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

/** ✅ 공용 categories 타입과 맞추기 */
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
  category: Category | null; // ✅ null 방어 (미분류)
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
  status: string;
  files: any[]; // ✅ []는 타입이 아니라 값이라 any[]로
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
};

export type UpdateNoticeResponse = ApiResponse<{ noticeId: number }, null>;

/** Response */
export type NoticeListResponse = ApiResponse<NoticeListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

export type CreateNoticeResponseDto = { noticeId: number };
export type CreateNoticeResponse = ApiResponse<CreateNoticeResponseDto, null>;

export type NoticeCategoryListResponse = ApiResponse<Category[], null>;
