"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import styles from "./ResourceDetailPage.module.css";
import type { ResourceListItemDto, LoadState } from "../../api/types";
import { fetchResourceDetail } from "../../api/resourcesApi";
import { Button } from "@/components/button";
import toast from "react-hot-toast";
import DeleteModal from "../modal/DeleteModal.client";
import { useI18n } from "@/i18n/useI18n";

function normalizeDetail(payload: any): ResourceListItemDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    resourceId: Number(raw?.resourceId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    files: Array.isArray(raw?.files) ? raw.files : [],
  };
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

export default function ResourceDetailpageClient() {
  const router = useRouter();
  const t = useI18n("community.resources.admin.detail");
  const params = useParams<{ resourceId?: string }>();
  const resourceId = useMemo(() => Number(params?.resourceId ?? 0), [params]);
  const inFlightRef = useRef<{ id: number; promise: Promise<ResourceListItemDto> } | null>(null);

  const [load, setLoad] = useState<LoadState<ResourceListItemDto>>({
    loading: true,
    error: null,
    data: null,
  });

  const sp = useSearchParams();
  const toastOnceRef = useRef<string | null>(null);

  // ✅ toast=updated/created/deleted 처리
  useEffect(() => {
    if (!resourceId || Number.isNaN(resourceId)) return;

    const toastType = sp.get("toast");
    if (!toastType) return;

    // ✅ StrictMode 중복 방지
    if (toastOnceRef.current === toastType) return;
    toastOnceRef.current = toastType;

    if (toastType === "updated") toast.success(t("toasts.updated"), { id: "resource-updated" });
    if (toastType === "created") toast.success(t("toasts.created"), { id: "resource-created" });
    if (toastType === "deleted") toast.success(t("toasts.deleted"), { id: "resource-deleted" });

    // ✅ toast query 제거
    const next = new URLSearchParams(sp.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `/admin/community/resources/${resourceId}?${qs}` : `/admin/community/resources/${resourceId}`);
  }, [sp, router, resourceId, t]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openDelete = () => setDeleteOpen(true);
  const closeDelete = () => {
    if (deleteLoading) return;
    setDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!resourceId || Number.isNaN(resourceId)) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/community/resources/${resourceId}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${t("errors.deleteFailed")} (${res.status})`);
      }

      setDeleteOpen(false);
      router.push("/admin/community/resources?toast=deleted");
    } catch (e: any) {
      toast.error(e?.message ?? t("errors.deleteFailed"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ 상세 로드
  useEffect(() => {
    if (!resourceId || Number.isNaN(resourceId)) {
      setLoad({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoad({ loading: true, error: null, data: null });
        const promise = (() => {
          const inFlight = inFlightRef.current;
          if (inFlight && inFlight.id === resourceId) return inFlight.promise;

          const nextPromise = fetchResourceDetail(resourceId).then(normalizeDetail);
          inFlightRef.current = { id: resourceId, promise: nextPromise };
          nextPromise.finally(() => {
            if (inFlightRef.current?.id === resourceId && inFlightRef.current?.promise === nextPromise) {
              inFlightRef.current = null;
            }
          });
          return nextPromise;
        })();

        const data = await promise;
        if (!alive) return;
        setLoad({ loading: false, error: null, data });
      } catch (e: any) {
        if (!alive) return;
        setLoad({
          loading: false,
          error: e?.message ?? t("errors.loadFailed"),
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [resourceId, t]);

  const data = load.data;

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
            <span className={styles.crumb} onClick={() => router.push("/admin/community/resources")}>
              {t("title")}
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>{t("breadcrumbCurrent")}</span>
          </div>
          <div className={styles.breadcrumbActions}>
            <Button variant="secondary" onClick={() => router.push("/admin/community/resources")}>
              {t("buttons.list")}
            </Button>
          </div>
        </div>

        <h1 className={styles.title}>{t("title")}</h1>

        {load.error && <div className={styles.errorMessage}>{load.error}</div>}
        {load.loading && <div className={styles.loadingBox}>{t("loading")}</div>}

        {!load.loading && data && (
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

                        const url = typeof f === "object" ? f?.url ?? f?.downloadUrl ?? f?.path ?? "" : "";

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
          onClick={() => router.push(`/admin/community/resources/${resourceId}/edit`)}
          disabled={load.loading || !resourceId}
        >
          {t("buttons.edit")}
        </Button>

        <Button variant="danger" disabled={load.loading || !resourceId} onClick={openDelete}>
          {t("buttons.delete")}
        </Button>
      </div>

      <DeleteModal
        open={deleteOpen}
        targetLabel={t("targetLabel")}
        targetTitle={load.data?.title}
        loading={deleteLoading}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
