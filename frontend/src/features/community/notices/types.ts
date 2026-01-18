export type NoticeCategory = "서비스" | "학사" | "행사" | "일반";

export interface NoticeAttachment {
  name: string;
  url?: string; // 추후 다운로드 링크용
}

export interface Notice {
  id: string;            // 라우팅용
  no: string;            // 화면 표시 번호(00001)
  category: NoticeCategory;
  title: string;
  content: string;       // 상세/에디터 본문(현재는 텍스트)
  author: string;
  createdAt: string;     // YYYY.MM.DD
  views: number;
  attachment?: NoticeAttachment;
}
