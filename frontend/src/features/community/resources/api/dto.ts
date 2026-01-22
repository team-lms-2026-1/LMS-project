import type { ResourceItem, ResourceCategory } from "../types";

export type ResourcesListParams = {
  category?: "전체" | ResourceCategory;
  keyword?: string;
  page?: number;
  size?: number;
};

export type ResourceListItemDto = ResourceItem;

// 응답이 배열 or {items,total} 섞여도 대응
export type ResourcesListResponseDto =
  | ResourceListItemDto[]
  | { items: ResourceListItemDto[]; total?: number }
  | { data: ResourceListItemDto[] }
  | { data: { items: ResourceListItemDto[]; total?: number } };

export type CreateResourceRequestDto = {
  title: string;
  category: ResourceCategory;
  content: string;
  // 첨부는 일단 제외(백엔드 스펙 나오면 multipart로 확장)
};

export type UpdateResourceRequestDto = CreateResourceRequestDto;
