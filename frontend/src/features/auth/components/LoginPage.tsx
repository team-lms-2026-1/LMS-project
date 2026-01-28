"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/features/auth/styles/auth.module.css";
import { loginViaBff, logoutViaBff, scheduleAutoLogout } from "@/features/auth/lib/auth.client";

export default function LoginPage() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  function resolveRedirectPath(loginId: string) {
    const prefix = (loginId?.trim()?.[0] ?? "").toLowerCase();
    if (prefix === "a") return "/admin";
    if (prefix === "s") return "/";
    if (prefix === "p") return "/pro";
    // 예외: 규칙 밖이면 기본값(원하면 변경)
    return "/";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedId = id.trim();

    // ✅ ID 규칙: 문자 1개 + 숫자 8자리 (총 9자리) + 앞문자 a/s/p
    const ok = /^[asp][0-9]{8}$/i.test(trimmedId);
    if (!ok) {
      alert("아이디 형식이 올바르지 않습니다. (a|s|p + 숫자 8자리, 예: a12345678)");
      return;
    }

    setLoading(true);

    try {
      // ✅ 로그인은 1번만 호출
      const res = await loginViaBff({ id: trimmedId, password: pw });

      // ✅ expiresAt이 있으면 자동 로그아웃 스케줄링
      const expiresAt = (res as any)?.expiresAt;
      if (expiresAt) {
        scheduleAutoLogout(expiresAt, async () => {
          await logoutViaBff();
          router.replace("/login");
        });
      }

      // ✅ 역할(prefix) 기반 라우팅
      router.replace(resolveRedirectPath(trimmedId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인에 실패했습니다.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.left}>
          <div className={styles.brandRow}>
            <img className={styles.logo} src="/logo.png" alt="학교 로고" />
            <div>
              <div className={styles.title}>교직원 · 학생 통합시스템 로그인</div>
              <div className={styles.sub}>아이디와 비밀번호를 입력하여 로그인하세요.</div>
            </div>
          </div>

          <form className={styles.form} onSubmit={onSubmit}>
            <div>
              <div className={styles.label}>ID</div>
              <input
                className={styles.input}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디"
                autoComplete="username"
              />
            </div>

            <div>
              <input
                className={styles.input}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="비밀번호"
                type="password"
                autoComplete="current-password"
              />
              <div className={styles.rowBetween}>
                <div className={styles.label}>Password</div>
                <Link className={styles.link} href="/forgot-password">
                  forgot password
                </Link>
              </div>
            </div>

            <button className={styles.button} type="submit" disabled={loading || !id || !pw}>
              {loading ? "로그인 중..." : "Login"}
            </button>
          </form>
        </section>

        <section className={styles.right}>
          <img className={styles.heroImg} src="/campus.jpg" alt="캠퍼스" />
          <div className={styles.heroOverlay} />
          <div className={styles.heroText}>장로회신대학교</div>
        </section>
      </div>
    </div>
  );
}
