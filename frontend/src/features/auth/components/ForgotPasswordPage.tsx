"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/features/auth/styles/auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: 나중에 BFF 연결
      // await requestPasswordReset({ email });

      console.log("forgot password submit", { email });
      alert("재설정 메일 발송(임시). 백엔드 연결 후 실제 발송 처리하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.centerCard}>
        <div className={styles.centerInner}>
          <div style={{ fontSize: 14, color: "#2563eb", textAlign: "left" }}>
            Forgot Password Page
          </div>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.ac.kr"
              autoComplete="email"
            />

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
