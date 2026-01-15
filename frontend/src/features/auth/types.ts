export type LoginRequest = {
  id: string;
  password: string;
};

export type LoginSuccess = {
  // 아래는 예시입니다. 백엔드 스펙에 맞춰 수정하세요.
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
