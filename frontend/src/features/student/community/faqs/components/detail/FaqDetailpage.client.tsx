"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./FaqDetailPage.module.css";
import type { FaqListItemDto } from "../../api/types";
import { fetchFaqDetail } from "../../api/faqsApi";
import { useI18n } from "@/i18n/useI18n";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: FaqListItemDto | null };

function normalizeDetail(payload: any): FaqListItemDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    faqId: Number(raw?.faqId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
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

export default function FaqDetailpageClient() {
  const router = useRouter();
  const t = useI18n("community.faqs.student.detail");
  const params = useParams<{ faqId?: string }>();
  const faqId = useMemo(() => Number(params?.faqId ?? 0), [params]);
  const inFlightRef = useRef<{ id: number; promise: Promise<FaqListItemDto> } | null>(null);

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!faqId || Number.isNaN(faqId)) {
      setState({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const promise = (() => {
          const inFlight = inFlightRef.current;
          if (inFlight && inFlight.id === faqId) return inFlight.promise;

          const nextPromise = fetchFaqDetail(faqId).then(normalizeDetail);
          inFlightRef.current = { id: faqId, promise: nextPromise };
          nextPromise.finally(() => {
            if (inFlightRef.current?.id === faqId && inFlightRef.current?.promise === nextPromise) {
              inFlightRef.current = null;
            }
          });
          return nextPromise;
        })();

        const data = await promise;
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
  }, [faqId, t]);

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
          <span className={styles.crumb} onClick={() => router.push("/student/community/faqs")}>
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

            <div className={styles.footerRow}>
              <button className={styles.backBtn} onClick={() => router.push("/student/community/faqs")}>
                {t("buttons.list")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
