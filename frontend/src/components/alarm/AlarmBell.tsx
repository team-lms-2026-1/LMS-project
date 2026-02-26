"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { getJson } from "@/lib/http";
import { useAuth } from "@/features/auth/AuthProvider";
import { useI18n } from "@/i18n/useI18n";
import styles from "./AlarmBell.module.css";

type ApiResponse<T> = {
  data: T;
  meta: any | null;
};

type AlarmItem = {
  alarmId: number;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  read: boolean;
  createdAt?: string | null;
};

type UnreadCountDto = {
  unreadCount: number;
};

const PAGE_SIZE = 20;
const POLL_MS = 30000;

function formatDateTime(value?: string | null) {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
}

function resolveAlarmLink(accountType: string | undefined, linkUrl?: string | null) {
  if (!linkUrl) return "";
  const raw = linkUrl.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path.startsWith("/admin") || path.startsWith("/student") || path.startsWith("/professor")) {
    return path;
  }

  const role = (accountType ?? "").toUpperCase();
  const prefix =
    role === "ADMIN" ? "/admin" : role === "PROFESSOR" ? "/professor" : role === "STUDENT" ? "/student" : "";

  if (!prefix) return path;

  if (role === "PROFESSOR" && path.startsWith("/community/qna/questions/")) {
    const id = path.split("/").pop();
    if (id) return `${prefix}/community/qna/${id}`;
  }

  if ((role === "STUDENT" || role === "PROFESSOR") && path.startsWith("/mentoring/recruitments/")) {
    return `${prefix}/mentoring/apply`;
  }

  if ((role === "STUDENT" || role === "PROFESSOR") && path.startsWith("/mentoring/matchings/")) {
    return `${prefix}/mentoring/chat`;
  }

  return `${prefix}${path}`;
}

type AlarmBadge = {
  label: string;
  className?: string;
};

type Translator = ReturnType<typeof useI18n>;

function getAlarmBadge(t: Translator, type?: string | null): AlarmBadge | null {
  if (!type) return null;
  switch (type) {
    case "NOTICE_NEW":
      return { label: t("alarm.badge.notice"), className: styles.itemBadgeNotice };
    case "MENTORING_NEW_APPLICATION":
      return { label: t("alarm.badge.mentoringNew"), className: styles.itemBadgeMentoring };
    case "MENTORING_APPLICATION_STATUS":
      return { label: t("alarm.badge.mentoringStatus"), className: styles.itemBadgeMentoring };
    case "MENTORING_QUESTION_ANSWERED":
      return { label: t("alarm.badge.mentoringAnswer"), className: styles.itemBadgeMentoring };
    case "MENTORING_CHAT_MESSAGE":
      return { label: t("alarm.badge.mentoringChat"), className: styles.itemBadgeMentoring };
    case "COMMUNITY_COMMENT":
    case "QNA_COMMENT":
      return { label: t("alarm.badge.qnaComment"), className: styles.itemBadgeCommunity };
    case "QNA_NEW_QUESTION":
      return { label: t("alarm.badge.qnaQuestion"), className: styles.itemBadgeCommunity };
    case "CURRICULAR_SCORE_ASSIGNED":
      return { label: t("alarm.badge.curricularScore"), className: styles.itemBadgeCurricular };
    case "CURRICULAR_GRADE_CONFIRMED":
      return { label: t("alarm.badge.curricularGrade"), className: styles.itemBadgeCurricular };
    case "DIAGNOSIS_REMINDER":
      return { label: t("alarm.badge.diagnosis"), className: styles.itemBadgeSurvey };
    case "EXTRA_SESSION_CREATED":
      return { label: t("alarm.badge.extraSession"), className: styles.itemBadgeExtra };
    case "EXTRA_SESSION_VIDEO_UPLOADED":
      return { label: t("alarm.badge.extraVideo"), className: styles.itemBadgeExtra };
    case "EXTRA_OFFERING_COMPLETED":
      return { label: t("alarm.badge.extraCompleted"), className: styles.itemBadgeExtra };
    case "STUDY_RENTAL_REQUESTED":
      return { label: t("alarm.badge.studyRentalRequest"), className: styles.itemBadgeStudy };
    case "STUDY_RENTAL_APPROVED":
    case "STUDY_RENTAL_REJECTED":
      return { label: t("alarm.badge.studyRentalStatus"), className: styles.itemBadgeStudy };
    case "SURVEY_NEW":
      return { label: t("alarm.badge.survey"), className: styles.itemBadgeSurvey };
    default:
      return null;
  }
}

function normalizeTitle(item: AlarmItem, fallbackTitle: string) {
  const raw = item.title?.trim() ?? "";
  if (!raw) return fallbackTitle;
  if (item.type === "NOTICE_NEW") {
    const cleaned = raw.replace(/^\s*\[(notice|공지사항)\]\s*/i, "").trim();
    return cleaned || raw;
  }
  return raw;
}

export default function AlarmBell() {
  const { state } = useAuth();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const t = useI18n("topbar");

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AlarmItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountType = state.me?.accountType;
  const alarmTitle = t("alarm.title");

  const loadUnreadCount = async () => {
    try {
      const res = await getJson<ApiResponse<UnreadCountDto>>("/api/alarms/unread-count");
      const count = Number(res?.data?.unreadCount ?? 0);
      if (Number.isFinite(count)) setUnreadCount(count);
    } catch (e) {
      console.warn("[AlarmBell] unread-count failed", e);
    }
  };

  const loadList = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await getJson<ApiResponse<AlarmItem[]>>(`/api/alarms?page=1&size=${PAGE_SIZE}`);
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e: any) {
      console.error("[AlarmBell] list failed", e);
      setError(e?.message || t("alarm.error.load"));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!alive) return;
      await loadUnreadCount();
    };

    run();
    const id = window.setInterval(run, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadList();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && wrapRef.current && !wrapRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleItemClick = async (item: AlarmItem) => {
    if (!item.read) {
      try {
        await getJson(`/api/alarms/${item.alarmId}/read`, { method: "PATCH" });
        setItems((prev) =>
          prev.map((it) => (it.alarmId === item.alarmId ? { ...it, read: true } : it))
        );
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      } catch (e) {
        console.error("[AlarmBell] mark read failed", e);
      }
    }

    const link = resolveAlarmLink(accountType, item.linkUrl);
    setOpen(false);

    if (link) {
      if (/^https?:\/\//i.test(link)) {
        window.location.href = link;
      } else {
        router.push(link);
      }
    }
  };

  const handleReadAll = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    try {
      await getJson("/api/alarms/read-all", { method: "PATCH" });
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("[AlarmBell] read-all failed", e);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteAll = async () => {
    if (deletingAll || items.length === 0) return;

    if (!window.confirm(t("alarm.confirm.deleteAll"))) return;

    setError(null);
    setDeletingAll(true);
    try {
      await getJson("/api/alarms", { method: "DELETE" });
      setItems([]);
      setUnreadCount(0);
      void loadList();
    } catch (e: any) {
      console.error("[AlarmBell] delete-all failed", e);
      setError(e?.message || t("alarm.error.delete"));
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>, item: AlarmItem) => {
    event.preventDefault();
    event.stopPropagation();

    if (deletingId === item.alarmId) return;

    setError(null);
    setDeletingId(item.alarmId);
    try {
      await getJson(`/api/alarms/${item.alarmId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.alarmId !== item.alarmId));
      if (!item.read) {
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
      void loadList();
    } catch (e: any) {
      console.error("[AlarmBell] delete failed", e);
      setError(e?.message || t("alarm.error.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={alarmTitle}
      >
        <svg viewBox="0 0 24 24" className={styles.bellIcon} aria-hidden="true">
          <path
            d="M12 3a5 5 0 0 0-5 5v2.2c0 .6-.2 1.1-.6 1.5L5 13v1h14v-1l-1.4-1.3c-.4-.4-.6-.9-.6-1.5V8a5 5 0 0 0-5-5zm0 18a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 21z"
            fill="currentColor"
          />
        </svg>
        {unreadCount > 0 && <span className={styles.badge}>{badgeText}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label={alarmTitle}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>{alarmTitle}</div>
            <div className={styles.panelActions}>
              <button
                type="button"
                className={styles.panelAction}
                onClick={handleReadAll}
                disabled={markingAll || unreadCount === 0}
              >
                {t("alarm.markAllRead")}
              </button>
              <button
                type="button"
                className={`${styles.panelAction} ${styles.panelActionDanger}`}
                onClick={handleDeleteAll}
                disabled={deletingAll || items.length === 0}
              >
                {t("alarm.deleteAll")}
              </button>
            </div>
          </div>

          {error && <div className={styles.panelError}>{error}</div>}

          {loadingList ? (
            <div className={styles.panelEmpty}>{t("alarm.loading")}</div>
          ) : items.length === 0 ? (
            <div className={styles.panelEmpty}>{t("alarm.empty")}</div>
          ) : (
            <div className={styles.panelList}>
              {items.map((item) => {
                const badge = getAlarmBadge(t, item.type);
                const badgeClassName = badge?.className
                  ? `${styles.itemBadge} ${badge.className}`
                  : styles.itemBadge;
                return (
                  <div
                    key={item.alarmId}
                    className={`${styles.panelItem} ${item.read ? "" : styles.panelItemUnread}`}
                  >
                    <button
                      type="button"
                      className={styles.itemButton}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className={styles.itemHeader}>
                        {badge && <span className={badgeClassName}>{badge.label}</span>}
                        <div className={styles.itemTitle}>{normalizeTitle(item, alarmTitle)}</div>
                      </div>
                      {item.message && <div className={styles.itemMessage}>{item.message}</div>}
                      <div className={styles.itemMeta}>{formatDateTime(item.createdAt)}</div>
                    </button>
                    <button
                      type="button"
                      className={styles.itemDelete}
                      onClick={(event) => handleDelete(event, item)}
                      disabled={deletingId === item.alarmId}
                      aria-label={t("alarm.deleteOne")}
                      title={t("alarm.deleteOne")}
                    >
                      <svg viewBox="0 0 24 24" className={styles.itemDeleteIcon} aria-hidden="true">
                        <path
                          d="M6.4 6.4a1 1 0 0 1 1.4 0L12 10.6l4.2-4.2a1 1 0 1 1 1.4 1.4L13.4 12l4.2 4.2a1 1 0 0 1-1.4 1.4L12 13.4l-4.2 4.2a1 1 0 0 1-1.4-1.4L10.6 12 6.4 7.8a1 1 0 0 1 0-1.4z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
