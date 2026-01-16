export type AccountRole = "학생" | "교수" | "관리자";

export type AccountLoginStatus = "LOGGED_IN" | "LOGGED_OUT";

export type AccountSummary = {
  accountId: string;        // 로그인ID(예: A1800001, S201064)
  role: AccountRole;
  name: string;
  department?: string;      // 소속학과
  lastAccessAt: string;     // "YYYY.MM.DD HH:mm:ss"
  status: AccountLoginStatus;
};

export type AccountLogRow = {
  seq: number;              // 번호(예: 5555555)
  at: string;               // "YYYY.MM.DD HH:mm:ss"
  url: string;              // "/student/login"
  ip: string;               // "200.001.43.435"
  userAgent: string;        // "Android 13 (Chrome)" 등
};

export type AccountLogDetail = {
  account: AccountSummary;
  logs: AccountLogRow[];
};
