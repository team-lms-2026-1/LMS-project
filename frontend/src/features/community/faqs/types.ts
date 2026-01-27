export type FaqStatus = "게시 중" | "임시저장" | "비공개" | "삭제됨";

/** 백엔드 원본 상세(FAQ) */
export interface FaqDetail {
  faqId: number;
  categoryName: string;
  title: string;   // 질문
  content: string; // 답변
  authorName?: string;
  viewCount?: number;
  createdAt?: string;
  status?: FaqStatus;
}

export interface ApiResponse<T> {
  data: T;
  meta: unknown | null;
}

export type FaqDetailResponse = ApiResponse<FaqDetail>;

export interface FaqListItemBackend {
  faqId: number;
  categoryName: string;
  title: string;
  viewCount?: number;
  createdAt?: string;
  status?: FaqStatus;
}
