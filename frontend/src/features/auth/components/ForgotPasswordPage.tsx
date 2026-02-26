"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/features/auth/styles/auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "메일 발송에 실패했습니다.");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.centerCard}>
          <div className={styles.centerInner}>
            <img className={styles.centerLogo} src="/logo.png" alt="학교 로고" />

            <div className={styles.centerTitle}>메일이 발송되었습니다</div>
            <div className={styles.centerDesc}>
              <strong>{email}</strong>으로 비밀번호 재설정 링크를 보냈습니다.<br />
              받은 편지함을 확인해주세요. (유효시간 30분)
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Link className={styles.link} href="/login">
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.centerCard}>
        <div className={styles.centerInner}>
          <img className={styles.centerLogo} src="/logo.png" alt="학교 로고" />

          <div className={styles.centerTitle}>비밀번호 재설정</div>
          <div className={styles.centerDesc}>
            학교 계정의 이메일 주소를 입력해주세요.<br />
            비밀번호 재설정 링크가 발송됩니다.
          </div>

          <form className={styles.centerForm} onSubmit={onSubmit}>
            <div className={styles.label}>E-mail</div>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.ac.kr"
              autoComplete="email"
              required
            />

            {error && (
              <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>
                {error}
              </div>
            )}

            <button
              className={styles.centerButton}
              type="submit"
              disabled={loading || !email}
            >
              {loading ? "발송 중..." : "메일 발송"}
            </button>

            <div style={{ marginTop: 10, textAlign: "center" }}>
              <Link className={styles.link} href="/login">
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
