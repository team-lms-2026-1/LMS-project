export type ResourceCategory = "서비스" | "학사" | "행사" | "일반";

export interface ResourceAttachment {
  name: string;
  url?: string;
}

export interface ResourceItem {
  id: string;            // 라우팅용
  no: string;            // 00001
  category: ResourceCategory;
  title: string;
  content: string;

  author: string;
  createdAt: string;     // YYYY.MM.DD
  views: number;

  attachment?: ResourceAttachment;
}
