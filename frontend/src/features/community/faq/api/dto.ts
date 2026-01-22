import type { FaqCategory } from "../types";

export type FaqListParams = {
  category?: "전체" | FaqCategory;
  keyword?: string;
  page?: number;
  size?: number;
};

export type FaqListItemDto = {
  id: string | number;
  category: FaqCategory;
  title: string;
  content?: string;
  createdAt?: string;
  views?: number;
  author?: string;
};

export type FaqListResponseDto =
  | FaqListItemDto[]
  | { items: FaqListItemDto[]; total?: number }
  | { data: FaqListItemDto[] }
  | { data: { items: FaqListItemDto[]; total?: number } };

export type CreateFaqRequestDto = {
  title: string;
  category: FaqCategory;
  content: string;
};

export type UpdateFaqRequestDto = CreateFaqRequestDto;
