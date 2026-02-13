"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { getJson } from "@/lib/http";
import { useAuth } from "@/features/auth/AuthProvider";
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

function getAlarmBadge(type?: string | null): AlarmBadge | null {
  if (!type) return null;
  switch (type) {
    case "NOTICE_NEW":
      return { label: "공지사항", className: styles.itemBadgeNotice };
    case "MENTORING_NEW_APPLICATION":
      return { label: "멘토링 신청", className: styles.itemBadgeMentoring };
    case "MENTORING_APPLICATION_STATUS":
      return { label: "멘토링 결과", className: styles.itemBadgeMentoring };
    case "MENTORING_QUESTION_ANSWERED":
      return { label: "멘토링 답변", className: styles.itemBadgeMentoring };
    case "MENTORING_CHAT_MESSAGE":
      return { label: "멘토링 채팅", className: styles.itemBadgeMentoring };
    case "COMMUNITY_COMMENT":
      return { label: "커뮤니티 댓글", className: styles.itemBadgeCommunity };
    case "STUDY_RENTAL_APPROVED":
      return { label: "학습공간", className: styles.itemBadgeStudy };
    default:
      return null;
  }
}

function normalizeTitle(item: AlarmItem) {
  const raw = item.title?.trim() ?? "";
  if (!raw) return "알림";
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

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AlarmItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountType = state.me?.accountType;

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
      setError(e?.message || "알림을 불러오지 못했습니다.");
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

    if (!window.confirm("알림을 모두 삭제할까요?")) return;

    setError(null);
    setDeletingAll(true);
    try {
      await getJson("/api/alarms", { method: "DELETE" });
      setItems([]);
      setUnreadCount(0);
      void loadList();
    } catch (e: any) {
      console.error("[AlarmBell] delete-all failed", e);
      setError(e?.message || "알림 삭제에 실패했습니다.");
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
      setError(e?.message || "알림 삭제에 실패했습니다.");
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
        title="알림"
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
        <div className={styles.panel} role="dialog" aria-label="알림">
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>알림</div>
            <div className={styles.panelActions}>
              <button
                type="button"
                className={styles.panelAction}
                onClick={handleReadAll}
                disabled={markingAll || unreadCount === 0}
              >
                전체 읽음 처리
              </button>
              <button
                type="button"
                className={`${styles.panelAction} ${styles.panelActionDanger}`}
                onClick={handleDeleteAll}
                disabled={deletingAll || items.length === 0}
              >
                전체 삭제
              </button>
            </div>
          </div>

          {error && <div className={styles.panelError}>{error}</div>}

          {loadingList ? (
            <div className={styles.panelEmpty}>불러오는 중...</div>
          ) : items.length === 0 ? (
            <div className={styles.panelEmpty}>알림이 없습니다.</div>
          ) : (
            <div className={styles.panelList}>
              {items.map((item) => {
                const badge = getAlarmBadge(item.type);
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
                        <div className={styles.itemTitle}>{normalizeTitle(item)}</div>
                      </div>
                      {item.message && <div className={styles.itemMessage}>{item.message}</div>}
                      <div className={styles.itemMeta}>{formatDateTime(item.createdAt)}</div>
                    </button>
                    <button
                      type="button"
                      className={styles.itemDelete}
                      onClick={(event) => handleDelete(event, item)}
                      disabled={deletingId === item.alarmId}
                      aria-label="알림 삭제"
                      title="알림 삭제"
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
