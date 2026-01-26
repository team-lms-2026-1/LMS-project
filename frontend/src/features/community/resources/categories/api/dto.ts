export type ResourceCategoryDto = {
  categoryId: number;      // DB가 생성
  name: string;
  bgColorHex: string;
  textColorHex: string;

  postCount?: number;
  latestCreatedAt?: string;
};

export type ResourceCategoriesListResponseDto =
  | ResourceCategoryDto[]
  | { items: ResourceCategoryDto[]; total?: number }
  | { data: ResourceCategoryDto[] }
  | { data: { items: ResourceCategoryDto[]; total?: number } };

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
