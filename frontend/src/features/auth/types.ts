export type LoginRequest = {
  loginId: string;
  password: string;
};

export type LoginSuccess = {
  accessToken?: string;   // 토큰 기반이면 사용
  refreshToken?: string;  // 토큰 기반이면 사용
  user?: {
    id: string;
    name?: string;
    role?: string;
  };
};

export type ApiErrorShape = {
  message: string;
  code?: string;
};


export type AuthMeDto = {
  accountId: number;
  loginId: string;
  accountType: "ADMIN" | "PROFESSOR" | "STUDENT" | string;
  permissionCodes: string[];
};

export type ApiResponse<T> = {
  data: T;
  meta: any | null;
};