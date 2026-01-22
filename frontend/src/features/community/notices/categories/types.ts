export type NoticeCategoryId = string | number;

export type NoticeCategoryRow = {
  categoryId: NoticeCategoryId;
  name: string;

  // 색상
  bgColor: string;    // 배경색 (#RRGGBB)
  textColor: string;  // 글자색 (#RRGGBB)

  // 선택(백엔드가 주면 표시)
  postCount?: number;
  lastCreatedAt?: string;
};
