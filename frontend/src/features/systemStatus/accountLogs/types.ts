// types/accountLog.ts

export type AccountType = "ADMIN" | "PROFESSOR" | "STUDENT" | "STAFF";

export type AccountLogListItem = {
  accountId: number;
  loginId: string;
  accountType: AccountType | string; // 혹시 확장될 수 있으면 string 유지
  name: string;
  lastActivityAt: string | null;
  isOnline: boolean;
};

export type AccountLogSummary = {
  totalAccounts: number;
  onlineAccounts: number;
};

export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

export type AccountLogListResponse = {
  data: {
    items: AccountLogListItem[];
    summary: AccountLogSummary;
  };
  meta: PageMeta;
};

/* =========================
   ✅ 상세 화면용 타입 추가
========================= */

export type AccountLogDetailAccount = {
  accountId: number;
  loginId: string;
  accountType: AccountType | string;
  name: string;
  departmentName?: string | null; // "소속학과"
};

export type AccountAccessLogRow = {
  seq: number;            // 또는 logId(백엔드에 맞게)
  accessedAt: string;     // ISO string
  accessUrl: string;
  ip: string;
  userAgent: string;
};

export type AccountLogDetailResponse = {
  data: {
    account: AccountLogDetailAccount;
    logs: AccountAccessLogRow[];
  };
  meta: {
    from?: string;
    to?: string;
  };
};
