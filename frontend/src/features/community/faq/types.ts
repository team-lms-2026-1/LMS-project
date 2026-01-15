export type FaqCategory = "서비스" | "학습" | "정책" | "기타";

export interface FaqItem {
  id: string;          // 라우팅용
  no: string;          // 00001
  category: FaqCategory;

  title: string;       // 목록/상세 상단 제목
  content: string;     // 상세 본문(내용)

  author: string;
  createdAt: string;   // YYYY.MM.DD
  views: number;
}
