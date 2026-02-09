"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./FaqDetailPage.module.css";
import type { FaqListItemDto, LoadState } from "../../api/types";
import { fetchFaqDetail } from "../../api/FaqsApi";
import { Button } from "@/components/button";
import toast from "react-hot-toast";
import DeleteModal from "../modal/DeleteModal.client";

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
    status: String(raw?.status ?? ""),
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

  const [state, setState] = useState<LoadState<FaqListItemDto>>({
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
          error: e?.message ?? "FAQ를 불러오지 못했습니다.",
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [faqId]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!faqId || Number.isNaN(faqId)) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/community/faqs/${faqId}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `?? ?? (${res.status})`);
      }

      toast.success("FAQ가 삭제되었습니다.");
      router.push("/admin/community/faqs");
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
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
        {/* ✅ 상단: breadcrumb(좌) + 목록으로(우) */}
        <div className={styles.breadcrumbRow}>
          <div className={styles.breadcrumb}>
            <span className={styles.crumb} onClick={() => router.push("/admin/community/faqs")}>
              FAQ
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>상세페이지</span>
          </div>

          {/* ✅ 여기엔 목록으로만 */}
          <div className={styles.breadcrumbActions}>
            <Button variant="secondary" onClick={() => router.push("/admin/community/faqs")}>
              목록으로
            </Button>
          </div>
        </div>

        <h1 className={styles.title}>FAQ</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}
        {state.loading && <div className={styles.loadingBox}>불러오는 중...</div>}

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
            {/* ✅ 하단 우측: 수정/삭제 버튼 */}
          </div>
        )}
        
      </div>
      <div className={styles.bottomActions}>
              <Button
                variant="primary"
                onClick={() => router.push(`/admin/community/faqs/${faqId}/edit`)}
                disabled={state.loading || !faqId || deleting}
              >
                수정
              </Button>

              <Button
                variant="danger"
                disabled={state.loading || !faqId || deleting}
                onClick={() => setDeleteOpen(true)}
              >
                삭제
              </Button>
            </div>

      <DeleteModal
        open={deleteOpen}
        targetLabel="FAQ"
        targetTitle={data?.title}
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
