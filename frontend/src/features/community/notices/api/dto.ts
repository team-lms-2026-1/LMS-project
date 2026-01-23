import type { NoticeDetail, NoticeFile, NoticeListItemBackend } from "../types";

/** UI 목록 Row */
export type NoticeListItemDto = {
  id: number;
  categoryName: string;
  title: string;
  views: number;
  createdAt: string;
  status?: string;
};

/** UI 상세 */
export type NoticeDetailDto = {
  id: number;
  categoryName: string; // 백엔드 원본 유지(카테고리명)
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  views: number;
  status: string;
  files: NoticeFile[];
};

/** 백엔드 원본 타입 alias */
export type BackendNoticeDetail = NoticeDetail;
export type BackendNoticeListItem = NoticeListItemBackend;

/** 목록 파라미터 */
export type NoticeListParams = {
  keyword?: string;
  page?: number;
  size?: number;
  categoryId?: number; // ✅ 필요하면 사용
};

/**
 * ✅ 생성/수정 request(JSON 파트)
 * Postman에서 "request" 파트에 들어가는 JSON 형태
 */
export type NoticeRequestPart = {
  title: string;
  content: string;
  categoryId: number;
  deleteFileIds?: number[]; // 수정 시 첨부 삭제용
};

/**
 * ✅ 생성 요청(멀티파트)
 */
export type CreateNoticeRequestDto = {
  request: NoticeRequestPart; // deleteFileIds는 보통 없음
  files?: File[];
};

/**
 * ✅ 수정 요청(멀티파트)
 */
export type UpdateNoticeRequestDto = {
  request: NoticeRequestPart; // deleteFileIds 포함 가능
  files?: File[];
};
