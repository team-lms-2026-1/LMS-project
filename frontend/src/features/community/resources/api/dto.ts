import type { ResourceItem, ResourceAttachment } from "../types";

export type ResourcesListParams = {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
};

// ✅ 리스트 응답에서는 content/attachment가 없을 수 있으니 optional로 재정의
export type ResourceListItemDto = Omit<ResourceItem, "content" | "attachment"> & {
  content?: string;
  attachment?: ResourceAttachment;
};

export type ResourcesListResponseDto =
  | ResourceListItemDto[]
  | { items: ResourceListItemDto[]; total?: number }
  | { data: ResourceListItemDto[] }
  | { data: { items: ResourceListItemDto[]; total?: number } };

export type CreateResourceRequestDto = {
  title: string;
  categoryId: number; // ✅ DB 카테고리 PK
  content: string;
};

export type UpdateResourceRequestDto = CreateResourceRequestDto;
