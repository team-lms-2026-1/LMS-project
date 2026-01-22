import type { NoticeCategory } from "../types";

/** 백엔드 응답이 ApiResponse 래핑이면 여기서 맞춰 쓰세요 */
export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export type NoticeListParams = {
  category?: "전체" | NoticeCategory;
  keyword?: string;
  page?: number;
  size?: number;
};

export type NoticeListItemDto = {
  id: string | number;
  no?: string;                 // 백엔드에서 없으면 프론트에서 생성
  category: NoticeCategory;
  title: string;
  views: number;
  createdAt: string;           // ISO or YYYY.MM.DD
};

export type NoticeDetailDto = {
  id: string | number;
  category: NoticeCategory;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
  views: number;
  attachment?: {
    name: string;
    url?: string;
  } | null;
};

export type CreateNoticeRequestDto = {
  title: string;
  category: NoticeCategory;
  content: string;
  attachmentName?: string | null; // 현재 UI 기준(파일 업로드는 추후 multipart로 확장)
};

export type UpdateNoticeRequestDto = {
  title: string;
  category: NoticeCategory;
  content: string;
  attachmentName?: string | null;
};
