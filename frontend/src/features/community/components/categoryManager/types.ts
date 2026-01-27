export type CategoryId = number;

export type CategoryRow = {
  categoryId: CategoryId;
  name: string;
  postCount?: number;

  bgColor: string; // #RRGGBB
  textColor: string; // #RRGGBB
  lastCreatedAt?: string;
};

export type CategoryListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};

export type CreateCategoryBody = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

export type UpdateCategoryBody = Partial<CreateCategoryBody> & {
  name: string;
};

export type CategoryApi = {
  list(params: CategoryListParams): Promise<CategoryRow[]>;
  create(body: CreateCategoryBody): Promise<unknown>;
  update(categoryId: string, body: UpdateCategoryBody): Promise<unknown>;
  remove(categoryId: string): Promise<unknown>;
};
