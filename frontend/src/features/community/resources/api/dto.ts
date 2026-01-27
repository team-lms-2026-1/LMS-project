import type { ResourceAttachment } from "../types";

export type ResourcesListParams = {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
};

export type ResourceListItemDto = {
  id: string;                // resourceId string으로 통일
  no?: number;

  categoryId: number;
  categoryName?: string;

  title: string;
  content?: string;

  author?: string;
  createdAt?: string;
  views?: number;

  attachment?: ResourceAttachment;
};

export type ResourcesListResponseDto =
  | ResourceListItemDto[]
  | { items: ResourceListItemDto[]; total?: number }
  | { data: ResourceListItemDto[] }
  | { data: { items: ResourceListItemDto[]; total?: number } };

export type CreateResourceRequestDto = {
  title: string;
  categoryId: number;   // ✅ number
  content: string;
};

export type UpdateResourceRequestDto = CreateResourceRequestDto;
