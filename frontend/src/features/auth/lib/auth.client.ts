import type { LoginRequest, LoginSuccess, ApiErrorShape } from "../types";

type LoginBffResponse = {
  account: { accountId: number; loginId: string; accountType: string };
  expiresInSeconds: number;
  expiresAt: number;
};

const EXP_KEY = "auth_expires_at";

export async function logoutViaBff(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  // 로컬 만료정보도 제거
  localStorage.removeItem(EXP_KEY);
}

export function scheduleAutoLogout(expiresAt: number, onExpire: () => void) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) {
    onExpire();
    return () => {};
  }
  const id = window.setTimeout(onExpire, ms);
  return () => window.clearTimeout(id);
}

export async function loginViaBff(payload: LoginRequest): Promise<LoginBffResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let err: ApiErrorShape = { message: "로그인에 실패했습니다." };
    try {
      err = (await res.json()) as ApiErrorShape;
    } catch {}
    throw new Error(err.message || "로그인에 실패했습니다.");
  }

  const data = (await res.json()) as LoginBffResponse;

  // 만료시각 저장(토큰이 아니라 '시각'만 저장)
  localStorage.setItem(EXP_KEY, String(data.expiresAt));

  return data;
}

export function getStoredExpiresAt(): number | null {
  const v = localStorage.getItem(EXP_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
