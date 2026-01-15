"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/features/auth/styles/auth.module.css";
import { loginViaBff } from "@/features/auth/lib/auth.client";

export default function LoginPage() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await loginViaBff({ id, password: pw });

      // 성공 후 이동(원하는 페이지로 바꾸세요)
      router.replace("/(admin)");
      // 또는 router.replace("/admin") 등 프로젝트 라우팅에 맞게 수정
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "로그인에 실패했습니다.";
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
              <div className={styles.sub}>
                아이디와 비밀번호를 입력하여 로그인하세요.
              </div>
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
              <div className={styles.rowBetween}>
                <div className={styles.label}>Password</div>
                <Link className={styles.link} href="/forgot-password">
                  forgot password
                </Link>
              </div>
              <input
                className={styles.input}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="비밀번호"
                type="password"
                autoComplete="current-password"
              />
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={loading || !id || !pw}
            >
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
