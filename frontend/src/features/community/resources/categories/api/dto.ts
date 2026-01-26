export type ResourceCategoryDto = {
  categoryId: number; // DB 생성
  name: string;
  bgColorHex: string;
  textColorHex: string;

  postCount?: number;
  latestCreatedAt?: string;
};

export type ResourceCategoriesListResponseDto =
  | ResourceCategoryDto[]
  | { items: ResourceCategoryDto[]; total?: number }
  | { content: ResourceCategoryDto[]; totalElements?: number } // ✅ spring pageable 대응
  | { list: ResourceCategoryDto[] }
  | { data: ResourceCategoryDto[]; meta?: unknown }
  | { data: { items: ResourceCategoryDto[]; total?: number }; meta?: unknown }
  | { success?: boolean; data: ResourceCategoryDto[]; meta?: unknown }
  | { success?: boolean; data: { items: ResourceCategoryDto[] }; meta?: unknown };

export type CreateResourceCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

export type UpdateResourceCategoryRequestDto = CreateResourceCategoryRequestDto;

export type ResourceCategoriesListParams = {
  keyword?: string;
  page?: number;
  size?: number;
};
