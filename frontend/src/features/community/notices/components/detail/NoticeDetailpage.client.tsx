"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./NoticeDetailPage.module.css";
import type { LoadState, NoticeListItemDto } from "../../api/types";
import { fetchNoticeDetail } from "../../api/noticesApi";
import { Button } from "@/components/button";
import DeleteModal from "../modal/DeleteModal.client";
import { useI18n } from "@/i18n/useI18n";

function normalizeDetail(payload: any): NoticeListItemDto {
  const raw = payload?.data ?? payload;

  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  const displayStartAt =
    raw?.displayStartAt ?? raw?.display_start_at ?? raw?.displayStart ?? raw?.startAt ?? "";

  const displayEndAt =
    raw?.displayEndAt ?? raw?.display_end_at ?? raw?.displayEnd ?? raw?.endAt ?? "";

  return {
    noticeId: Number(raw?.noticeId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    status: String(raw?.status ?? ""),
    files: Array.isArray(raw?.files) ? raw.files : [],
    displayStartAt: displayStartAt ? String(displayStartAt) : "",
    displayEndAt: displayEndAt ? String(displayEndAt) : "",
  };
}

function formatPeriod(start?: string, end?: string) {
  const s = start ? String(start).slice(0, 10) : "";
  const e = end ? String(end).slice(0, 10) : "";
  if (!s && !e) return "-";
  if (s && !e) return `${s} ~`;
  if (!s && e) return `~ ${e}`;
  return `${s} ~ ${e}`;
}

function formatDateTime(v: string) {
  if (!v) return "-";
  if (v.includes(" ")) return v;

  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function NoticeDetailpageClient() {
  const router = useRouter();
  const t = useI18n("community.notices.admin.detail");
  const params = useParams<{ noticeId?: string }>();

  const noticeIdParam = params?.noticeId;
  const noticeId = useMemo(() => Number(noticeIdParam ?? 0), [noticeIdParam]);

  const [state, setState] = useState<LoadState<NoticeListItemDto>>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!noticeId || Number.isNaN(noticeId)) {
      setState({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const res = await fetchNoticeDetail(noticeId);
        const data = normalizeDetail(res);
        if (!alive) return;
        setState({ loading: false, error: null, data });
      } catch (e: any) {
        if (!alive) return;
        setState({
          loading: false,
          error: e?.message ?? t("errors.loadFailed"),
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [noticeId, t]);

  // ✅ 삭제 모달
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!noticeId || Number.isNaN(noticeId)) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/community/notices/${noticeId}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${t("errors.deleteFailed")} (${res.status})`);
      }

      toast.success(t("toasts.deleteSuccess"));
      router.push(`/admin/community/notices`);
    } catch (e: any) {
      toast.error(e?.message ?? t("errors.deleteFailed"));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const data = state.data;

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumbRow}>
          <div className={styles.breadcrumb}>
            <span className={styles.crumb} onClick={() => router.push("/admin/community/notices")}>
              {t("title")}
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>{t("breadcrumbCurrent")}</span>
          </div>

          <div className={styles.breadcrumbActions}>
            <Button variant="secondary" onClick={() => router.push("/admin/community/notices")}>
              {t("buttons.list")}
            </Button>
          </div>
        </div>

        <h1 className={styles.title}>{t("title")}</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}
        {state.loading && <div className={styles.loadingBox}>{t("loading")}</div>}

        {!state.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {data.category?.name ?? t("uncategorized")}
              </span>
              <div className={styles.headTitle}>{data.title}</div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.author")}</span>
                <span className={styles.metaValue}>{data.authorName || "-"}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.createdAt")}</span>
                <span className={styles.metaValue}>{formatDateTime(data.createdAt)}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.views")}</span>
                <span className={styles.metaValue}>{data.viewCount}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.period")}</span>
                <span className={styles.metaValue}>{formatPeriod(data.displayStartAt, data.displayEndAt)}</span>
              </div>
            </div>

            <div className={styles.contentBox}>
              <div className={styles.contentText}>{data.content}</div>
            </div>

            <div className={styles.attachBox}>
              <div className={styles.attachRow}>
                <div className={styles.attachLabel}>{t("labels.attachment")}</div>

                <div className={styles.attachList}>
                  {Array.isArray(data.files) && data.files.length > 0 ? (
                    <ul className={styles.attachUl}>
                      {data.files.map((f: any, idx: number) => {
                        const name =
                          typeof f === "string"
                            ? f
                            : String(
                              f?.fileName ?? f?.name ?? f?.originalName ?? t("attachmentFallback", { index: idx + 1 })
                            );

                        const url = typeof f === "object" ? (f?.url ?? f?.downloadUrl ?? f?.path ?? "") : "";

                        return (
                          <li key={idx} className={styles.attachLi}>
                            {url ? (
                              <a className={styles.attachLink} href={url} target="_blank" rel="noreferrer">
                                {name}
                              </a>
                            ) : (
                              <span className={styles.attachName}>{name}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className={styles.attachEmpty}>{t("attachmentEmpty")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottomActions}>
        <Button
          variant="primary"
          onClick={() => router.push(`/admin/community/notices/${noticeId}/edit`)}
          disabled={state.loading || !noticeId}
        >
          {t("buttons.edit")}
        </Button>

        <Button variant="danger" disabled={state.loading || !noticeId} onClick={() => setDeleteOpen(true)}>
          {t("buttons.delete")}
        </Button>
      </div>

      <DeleteModal
        open={deleteOpen}
        targetLabel={t("title")}
        targetTitle={state.data?.title}
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
