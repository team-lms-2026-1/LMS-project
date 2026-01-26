export type NoticeStatus = "게시 중" | "임시저장" | "비공개" | "삭제됨";

export interface NoticeFile {
  fileId?: number;        // 백엔드가 attachment_id 등을 내려주면 여기에 매핑
  fileName?: string;
  originalName?: string;
  contentType?: string;
  size?: number;
  url?: string;
}

/** 백엔드 원본 상세(현재 스펙: categoryName으로 내려옴) */
export interface NoticeDetail {
  noticeId: number;
  categoryName: string; // ✅ 백엔드는 name
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
  status: NoticeStatus;
  files: NoticeFile[];
}

export interface ApiResponse<T> {
  data: T;
  meta: unknown | null;
}

export type NoticeDetailResponse = ApiResponse<NoticeDetail>;

export interface NoticeListItemBackend {
  noticeId: number;
  categoryName: string;
  title: string;
  viewCount: number;
  createdAt: string;
  status?: NoticeStatus;
}
