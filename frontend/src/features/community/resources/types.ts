export interface ResourceAttachment {
  name: string;
  url?: string;
}

export interface ResourceItem {
  id: string;
  no?: string;

  categoryId: number;
  categoryName?: string;

  title: string;

  // ✅ 리스트 응답에는 content가 없을 수 있으므로 optional
  content?: string;

  author?: string;
  createdAt?: string;
  views?: number;

  // ✅ attachment optional
  attachment?: ResourceAttachment;
}
