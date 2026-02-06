"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./professor-shell.module.css";

const EXP_KEY = "auth_expires_at";

function formatDateKR(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatRemain(ms: number) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    if (h > 0) return `${String(h).padStart(2, "0")}:${mm}:${ss}`;
    return `${mm}:${ss}`;
}

async function logoutViaBff() {
    try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
        localStorage.removeItem(EXP_KEY);
    }
}

export default function ProfessorTopbar() {
    const router = useRouter();
    const today = useMemo(() => formatDateKR(new Date()), []);

    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [remainText, setRemainText] = useState<string>("");

    useEffect(() => {
        const v = localStorage.getItem(EXP_KEY);
        if (!v) return;
        const n = Number(v);
        if (!Number.isFinite(n)) return;
        setExpiresAt(n);
    }, []);

    useEffect(() => {
        if (!expiresAt) return;

        const tick = async () => {
            const ms = expiresAt - Date.now();
            if (ms <= 0) {
                setRemainText("00:00");
                await logoutViaBff();
                router.replace("/login");
                return;
            }
            setRemainText(formatRemain(ms));
        };

        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [expiresAt, router]);

    return (
        <div className={styles.topbarInner}>
            <div className={styles.topbarRight}>
                <div className={styles.dateChip} title="오늘 날짜">
                    {today}
                </div>

                {expiresAt && (
                    <div className={styles.sessionChip} title="자동 로그아웃까지 남은 시간">
                        {remainText ? `세션 ${remainText}` : "세션 --:--"}
                    </div>
                )}

                <button className={styles.profileBtn} type="button" title="프로필">
                    <span className={styles.profileAvatar} aria-hidden="true" />
                    <span className={styles.profileText}>교수</span>
                </button>
            </div>
        </div>
    );
}
