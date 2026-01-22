"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EXP_KEY = "auth_expires_at";

async function logoutViaBff() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // 네트워크 오류여도 UI는 로그인으로 보냄
  } finally {
    localStorage.removeItem(EXP_KEY);
  }
}

function getExpiresAt(): number | null {
  const v = localStorage.getItem(EXP_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function AdminSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const expiresAt = getExpiresAt();

    // expiresAt을 저장하지 않는 흐름(예: 새 탭/초기진입)도 있을 수 있으니
    // 여기서는 "있으면 강제 만료 처리"만 하고, 없는 경우는 middleware/서버 응답으로 막는 걸 권장
    if (!expiresAt) return;

    const ms = expiresAt - Date.now();
    if (ms <= 0) {
      (async () => {
        await logoutViaBff();
        router.replace("/login");
      })();
      return;
    }

    const id = window.setTimeout(async () => {
      await logoutViaBff();
      router.replace("/login");
    }, ms);

    return () => window.clearTimeout(id);
  }, [router]);

  return null;
}
