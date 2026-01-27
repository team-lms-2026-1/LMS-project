export type FaqCategoryListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};

export type FaqCategoryBackendRow = {
  categoryId: number;
  name: string;
  postCount?: number;
  bgColorHex: string;
  textColorHex: string;
  createdAt?: string;
};

export type FaqCategoryListResponseDto =
  | FaqCategoryBackendRow[]
  | { items: FaqCategoryBackendRow[]; total?: number }
  | { data: FaqCategoryBackendRow[]; meta?: any };

export type CreateFaqCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

export type UpdateFaqCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};
