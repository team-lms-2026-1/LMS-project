import type { NoticeCategoryRow } from "../types";

export type NoticeCategoryListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};

export type NoticeCategoryListResponseDto =
  | NoticeCategoryRow[]                                // 백엔드가 배열로 주는 경우
  | { items: NoticeCategoryRow[]; total?: number };     // 백엔드가 페이징 구조인 경우

export type CreateNoticeCategoryRequestDto = {
  name: string;
  bgColor: string;
  textColor: string;
};

export type UpdateNoticeCategoryRequestDto = CreateNoticeCategoryRequestDto;
