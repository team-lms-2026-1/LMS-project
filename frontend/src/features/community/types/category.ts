export type CategoryId = string | number;

export type CategoryRow = {
  categoryId: CategoryId;
  name: string;
  bgColor: string;
  textColor: string;

  postCount?: number;
  lastCreatedAt?: string;
};

export type CategoryListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};
