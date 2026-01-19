import type { LoginRequest, LoginSuccess, ApiErrorShape } from "../types";

export async function loginViaBff(payload: LoginRequest): Promise<LoginSuccess> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 쿠키 기반 세션/토큰 저장을 위해 포함(동일 오리진이면 필수는 아니지만 안전)
    credentials: "include",
    body: JSON.stringify(payload),
  });

  // BFF에서 에러를 JSON으로 내려주는 전제
  if (!res.ok) {
    let err: ApiErrorShape = { message: "로그인에 실패했습니다." };
    try {
      err = (await res.json()) as ApiErrorShape;
    } catch {
      // ignore
    }
    throw new Error(err.message || "로그인에 실패했습니다.");
  }

  return (await res.json()) as LoginSuccess;
}
