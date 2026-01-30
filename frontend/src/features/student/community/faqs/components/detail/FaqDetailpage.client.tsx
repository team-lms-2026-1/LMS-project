"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./FaqDetailPage.module.css";
import type { FaqListItemDto } from "../../api/types";
import { fetchFaqDetail } from "../../api/FaqsApi";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: FaqListItemDto | null };

function normalizeDetail(payload: any): FaqListItemDto {
  // 응답 형태가 {data:{...}} / {...} 섞여도 동작하게 방어
  const raw = payload?.data ?? payload;

  // 최소 필드 보정(백엔드가 createdAt/cerateAt 등 오타 섞이는 경우 대비)
  const created =
    raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

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
  // "2026-01-21 08:13" 같이 이미 포맷이면 그대로, ISO면 간단 변환
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
  const params = useParams<{ faqId?: string }>();
  const faqId = useMemo(() => Number(params?.faqId ?? 0), [params]);

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!faqId || Number.isNaN(faqId)) {
      setState({ loading: false, error: "잘못된 FAQ ID입니다.", data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const res = await fetchFaqDetail(faqId);
        const data = normalizeDetail(res);
        if (!alive) return;
        setState({ loading: false, error: null, data });
      } catch (e: any) {
        if (!alive) return;
        setState({
          loading: false,
          error: e?.message ?? "자료을 불러오지 못했습니다.",
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [faqId]);

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
            FAQ
          </span>
          <span className={styles.sep}>›</span>
          <span className={styles.current}>상세페이지</span>
        </div>

        <h1 className={styles.title}>FAQ</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        {state.loading && (
          <div className={styles.loadingBox}>
            불러오는 중...
          </div>
        )}

        {!state.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {data.category?.name ?? "미분류"}
              </span>
              <div className={styles.headTitle}>{data.title}</div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성자</span>
                <span className={styles.metaValue}>{data.authorName || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성일</span>
                <span className={styles.metaValue}>{formatDateTime(data.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>조회수</span>
                <span className={styles.metaValue}>{data.viewCount}</span>
              </div>
            </div>

            <div className={styles.contentBox}>
              <div className={styles.contentText}>{data.content}</div>
            </div>

            <div className={styles.footerRow}>
              <button className={styles.backBtn} onClick={() => router.push("/student/community/faqs")}>
                목록으로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
