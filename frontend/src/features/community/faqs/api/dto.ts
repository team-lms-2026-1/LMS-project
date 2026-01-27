import type { FaqDetail, FaqListItemBackend } from "../types";

/** UI 목록 Row */
export type FaqListItemDto = {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  views: number;      // 없으면 0
  createdAt: string;  // 없으면 "-"
  status?: string;
};

/** UI 상세 */
export type FaqDetailDto = {
  id: number;
  categoryName: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  views: number;
  status: string;
};

/** 백엔드 원본 타입 alias */
export type BackendFaqDetail = FaqDetail;
export type BackendFaqListItem = FaqListItemBackend;

/** 목록 파라미터 */
export type FaqListParams = {
  keyword?: string;
  page?: number;
  size?: number;
  categoryId?: number;
};

/** ✅ 생성/수정 request(JSON) - (FAQ는 파일 없음) */
export type FaqRequestBody = {
  title: string;
  content: string;
  categoryId: number;
};

/** ✅ 생성 요청(JSON) */
export type CreateFaqRequestDto = {
  request: FaqRequestBody;
};

/** ✅ 수정 요청(JSON) */
export type UpdateFaqRequestDto = {
  request: FaqRequestBody;
};
