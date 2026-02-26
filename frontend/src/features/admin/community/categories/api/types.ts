export type ApiResponse<T, M = null> = {
  data: T;
  meta: M;
};

export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

export type Category = {
  categoryId: number;
  name: string;
  bgColorHex: HexColor;
  textColorHex: HexColor;
};


export type Page<T> = {
  items: T[];
  meta: PageMeta;
};

export type CategoryListResponse =
  | ApiResponse<Category[]>
  | ApiResponse<Page<Category>>;

export type CreateCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

export type UpdateCategoryRequestDto = Partial<CreateCategoryRequestDto>;

export type CreateCategoryResponseDto = ApiResponse<{ categoryId: number }>;
export type UpdateCategoryResponseDto = ApiResponse<{ categoryId: number }>;

export type CategoryListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export type CategoryScope = "notices" | "resources" | "faqs" | "qna";

export type HexColor = `#${string}`;

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    fieldErrors: null | Array<{ field: string; message: string }>;
  };
};
