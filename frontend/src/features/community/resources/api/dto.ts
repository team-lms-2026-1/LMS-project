import type { ResourceAttachment } from "../types";

export type ResourcesListParams = {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
};

export type ResourceListItemDto = {
  id: string;
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

/** ✅ 공지사항과 동일 패턴: 멀티파트 request JSON 파트 */
export type ResourceRequestPart = {
  title: string;
  content: string;
  categoryId: number;
  // 수정 시 파일 삭제 지원하는 백엔드라면 사용(없어도 됨)
  deleteFileIds?: number[];
};

export type CreateResourceRequestDto = {
  request: ResourceRequestPart;
  files?: File[];
};

export type UpdateResourceRequestDto = {
  request: ResourceRequestPart;
  files?: File[];
};
