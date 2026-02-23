"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ResourceDetailPage.module.css";
import type { ResourceListItemDto } from "../../api/types";
import { fetchResourceDetail } from "../../api/resourcesApi";
import { useI18n } from "@/i18n/useI18n";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: ResourceListItemDto | null };

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
  const t = useI18n("community.resources.student.detail");
  const params = useParams<{ resourceId?: string }>();
  const resourceId = useMemo(() => Number(params?.resourceId ?? 0), [params]);
  const fetchedIdRef = useRef<number | null>(null);

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!resourceId || Number.isNaN(resourceId)) {
      setState({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    if (fetchedIdRef.current === resourceId) return;
    fetchedIdRef.current = resourceId;

    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const res = await fetchResourceDetail(resourceId);
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
  }, [resourceId, t]);

  const data = state.data;

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumb}>
          <span className={styles.crumb} onClick={() => router.push("/student/community/resources")}>
            {t("title")}
          </span>
          <span className={styles.sep}>&gt;</span>
          <span className={styles.current}>{t("breadcrumbCurrent")}</span>
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

            <div className={styles.footerRow}>
              <button className={styles.backBtn} onClick={() => router.push("/student/community/resources")}>
                {t("buttons.list")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
