"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/features/auth/styles/auth.module.css";

function PasswordResetForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token") ?? "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.");
        }
    }, [token]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // 백엔드 규칙: 소문자+대문자+숫자 포함, 6자 이상, 공백 불가
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError("비밀번호는 6자 이상이며 영문 대문자, 소문자, 숫자를 모두 포함해야 합니다.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/password-reset/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const msg = data?.error?.message ?? data?.message ?? "비밀번호 재설정에 실패했습니다.";
                throw new Error(msg);
            }

            setSuccess(true);
            // 3초 후 로그인 페이지로 이동
            setTimeout(() => router.replace("/login"), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.centerCard}>
                    <div className={styles.centerInner}>
                        <img className={styles.centerLogo} src="/logo.png" alt="학교 로고" />
                        <div className={styles.centerTitle}>비밀번호가 변경되었습니다</div>
                        <div className={styles.centerDesc}>
                            새 비밀번호로 로그인해주세요.<br />
                            잠시 후 로그인 페이지로 이동합니다...
                        </div>
                        <div style={{ marginTop: 24, textAlign: "center" }}>
                            <Link className={styles.link} href="/login">
                                지금 로그인하기
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

                    <div className={styles.centerTitle}>새 비밀번호 설정</div>
                    <div className={styles.centerDesc}>
                        사용할 새 비밀번호를 입력해주세요.<br />
                        (대문자+소문자+숫자 포함, 6자 이상)
                    </div>

                    <form className={styles.centerForm} onSubmit={onSubmit}>
                        <div className={styles.label}>새 비밀번호</div>
                        <input
                            className={styles.input}
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="대문자+소문자+숫자 포함, 6자 이상"
                            autoComplete="new-password"
                            required
                            disabled={!token}
                        />

                        <div className={styles.label} style={{ marginTop: 12 }}>
                            새 비밀번호 확인
                        </div>
                        <input
                            className={styles.input}
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 재입력"
                            autoComplete="new-password"
                            required
                            disabled={!token}
                        />

                        {error && (
                            <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>
                                {error}
                            </div>
                        )}

                        <button
                            className={styles.centerButton}
                            type="submit"
                            disabled={loading || !token || !newPassword || !confirmPassword}
                        >
                            {loading ? "변경 중..." : "비밀번호 변경"}
                        </button>

                        <div style={{ marginTop: 10, textAlign: "center" }}>
                            <Link className={styles.link} href="/forgot-password">
                                재설정 메일 다시 받기
                            </Link>
                            {" · "}
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

export default function PasswordResetPage() {
    return (
        <Suspense>
            <PasswordResetForm />
        </Suspense>
    );
}
