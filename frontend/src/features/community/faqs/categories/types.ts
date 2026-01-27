export type FaqCategoryId = number;

export type FaqCategoryRow = {
  categoryId: FaqCategoryId;
  name: string;

  bgColor: string;
  textColor: string;

  postCount?: number;
  lastCreatedAt?: string;
};
