export type CategoryRow = {
  categoryId: number;
  name: string;
  bgColor: string;
  textColor: string;
  postCount?: number;
  latestCreatedAt?: string;
};

export type CategoryListParams = {
  keyword?: string;
  page?: number;
  size?: number;
};

export type CategoryApi = {
  list(params: CategoryListParams): Promise<CategoryRow[]>;
  create(body: Omit<CategoryRow, "categoryId" | "postCount" | "latestCreatedAt">): Promise<CategoryRow>;
  update(
    categoryId: number,
    body: Omit<CategoryRow, "categoryId" | "postCount" | "latestCreatedAt">
  ): Promise<CategoryRow>;
  remove(categoryId: number): Promise<unknown>;
};
