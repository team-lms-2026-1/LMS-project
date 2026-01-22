import type { QnaCategory } from "../types";

export type QnaListParams = {
  category?: "전체" | QnaCategory;
  keyword?: string;
  page?: number;
  size?: number;
};

export type QnaListItemDto = {
  id: string | number;
  category: QnaCategory;
  title: string;
  content?: string;
  createdAt?: string;
  views?: number;
  author?: string;

  // 답변 관련(백엔드가 주면 표시)
  answered?: boolean;
};

export type QnaListResponseDto =
  | QnaListItemDto[]
  | { items: QnaListItemDto[]; total?: number }
  | { data: QnaListItemDto[] }
  | { data: { items: QnaListItemDto[]; total?: number } };

export type CreateQnaRequestDto = {
  title: string;
  category: QnaCategory;
  content: string;
};

export type UpdateQnaRequestDto = CreateQnaRequestDto;
