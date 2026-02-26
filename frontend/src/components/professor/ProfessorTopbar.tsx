"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AlarmBell from "@/components/alarm/AlarmBell";
import { useAuth } from "@/features/auth/AuthProvider";
import { useLocale } from "@/hooks/useLocale";
import { useI18n } from "@/i18n/useI18n";
import { LOCALES } from "@/i18n/locale";
import styles from "./professor-shell.module.css";

const EXP_KEY = "auth_expires_at";

type AccountMeResponse = {
  data?: {
    name?: string | null;
  } | null;
};

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

async function fetchProfileName(): Promise<string | null> {
  try {
    const res = await fetch("/api/accounts/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = (await res.json()) as AccountMeResponse;
    const name = json?.data?.name;
    if (typeof name !== "string") return null;

    const trimmed = name.trim();
    return trimmed.length ? trimmed : null;
  } catch {
    return null;
  }
}

export default function ProfessorTopbar() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { locale, setLocale, mounted } = useLocale();
  const t = useI18n("topbar");
  const today = useMemo(() => formatDateKR(new Date()), []);

  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainText, setRemainText] = useState<string>("");
  const [profileName, setProfileName] = useState<string>("");

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

  useEffect(() => {
    let active = true;
    fetchProfileName().then((name) => {
      if (!active || !name) return;
      setProfileName(name);
    });
    return () => {
      active = false;
    };
  }, []);

  const profileLabel = profileName || authState.me?.loginId || t("fallback.professor");

  return (
    <div className={styles.topbarInner}>
      <div className={styles.topbarRight}>
        <div className={styles.dateChip} title={t("todayTitle")}>
          {today}
        </div>

        {mounted && (
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {LOCALES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: locale === lang ? "2px solid #0066cc" : "1px solid #ccc",
                  background: locale === lang ? "#e6f2ff" : "transparent",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: locale === lang ? "bold" : "normal",
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {expiresAt && (
          <div className={styles.sessionChip} title={t("sessionTitle")}>
            {remainText ? `${t("sessionPrefix")} ${remainText}` : t("sessionEmpty")}
          </div>
        )}

        <AlarmBell />
        <button className={styles.profileBtn} type="button" title={t("profileTitle")}>
          <span className={styles.profileAvatar} aria-hidden="true" />
          <span className={styles.profileText}>{profileLabel}</span>
        </button>
      </div>
    </div>
  );
}

