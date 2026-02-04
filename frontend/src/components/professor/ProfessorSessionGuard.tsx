"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EXP_KEY = "auth_expires_at";

async function logoutViaBff() {
    try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
        // ignore
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

export default function ProfessorSessionGuard() {
    const router = useRouter();

    useEffect(() => {
        const expiresAt = getExpiresAt();

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
