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
    if (prefix === "s") return "/student/main";
    if (prefix === "p") return "/professor";

    return "/";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedId = id.trim();
    const validId = /^[asp][0-9]{8}$/i.test(trimmedId);

    if (!validId) {
      alert("Invalid ID format. Use a|s|p + 8 digits (e.g., a12345678).");
      return;
    }

    setLoading(true);

    try {
      const res = await loginViaBff({ loginId: trimmedId, password: pw });
      const expiresAt = (res as any)?.expiresAt;

      if (expiresAt) {
        scheduleAutoLogout(expiresAt, async () => {
          await logoutViaBff();
          router.replace("/login");
        });
      }

      router.replace(resolveRedirectPath(trimmedId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginGlow} aria-hidden="true" />
      <div className={styles.loginCard}>
        <section className={styles.loginLeft}>
          <div className={styles.loginBrandRow}>
            <img className={styles.loginLogo} src="/logo.png" alt="School logo" />
            <div className={styles.loginBrandText}>
              <div className={styles.loginEyebrow}>Integrated System</div>
              <div className={styles.loginTitle}>Integrated System login</div>
              <div className={styles.loginSub}>Sign in with your ID and password.</div>
            </div>
          </div>

          <form className={styles.loginForm} onSubmit={onSubmit}>
            <div className={styles.loginField}>
              <div className={styles.loginLabel}>ID</div>
              <input
                className={styles.loginInput}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="s00000000"
                autoComplete="username"
              />
            </div>

            <div className={styles.loginField}>
              <div className={styles.loginLabel}>Password</div>
              <input
                className={styles.loginInput}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="s00000000"
                type="password"
                autoComplete="current-password"
              />
              <div className={styles.loginRowBetween}>
                <div className={styles.loginHint}>ID format: a/s/p + 8 digits</div>
                <Link className={styles.loginLink} href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button className={styles.loginButton} type="submit" disabled={loading || !id || !pw}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>

        <section className={styles.loginRight}>
          <img className={styles.loginHeroImg} src="/campus.jpg" alt="Campus" />
          <div className={styles.loginHeroOverlay} />
          <div className={styles.loginHeroTop}>
            <div className={styles.loginHeroText}>LMS</div>
            <div className={styles.loginHeroKicker}>Learning Management Suite</div>
          </div>
          <div className={styles.loginHeroContent}>
            <div className={styles.loginHeroStats}>
              <div className={styles.loginHeroStat}>
                <span>Access</span>
                <strong>Unified</strong>
              </div>
              <div className={styles.loginHeroStat}>
                <span>Flow</span>
                <strong>Simple</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
