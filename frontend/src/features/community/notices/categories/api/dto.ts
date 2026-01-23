import type { NoticeCategoryRow } from "../types";

export type NoticeCategoryListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};

// ✅ 백엔드 row 형태
export type NoticeCategoryBackendRow = {
  categoryId: number;
  name: string;
  postCount: number;
  bgColorHex: string;
  textColorHex: string;
  createdAt: string;
};

// ✅ 실제 응답 형태들(배열 / items / {data, meta})
export type NoticeCategoryListResponseDto =
  | NoticeCategoryBackendRow[]
  | { items: NoticeCategoryBackendRow[]; total?: number }
  | { data: NoticeCategoryBackendRow[]; meta?: any };

// ✅ 생성/수정 요청은 Hex 필드명으로 전송(네 캡처와 동일)
export type CreateNoticeCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

export type UpdateNoticeCategoryRequestDto = CreateNoticeCategoryRequestDto;

// (참고) UI row는 NoticeCategoryRow 그대로 사용
export type NoticeCategoryUiRow = NoticeCategoryRow;
