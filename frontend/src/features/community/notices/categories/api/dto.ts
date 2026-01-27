export type NoticeCategoryListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};

export type NoticeCategoryBackendRow = {
  categoryId: number;
  name: string;
  postCount?: number;
  bgColorHex: string;
  textColorHex: string;
  createdAt?: string;
};

export type NoticeCategoryListResponseDto =
  | NoticeCategoryBackendRow[]
  | { items: NoticeCategoryBackendRow[]; total?: number }
  | { data: NoticeCategoryBackendRow[]; meta?: any };

export type CreateNoticeCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

export type UpdateNoticeCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};
