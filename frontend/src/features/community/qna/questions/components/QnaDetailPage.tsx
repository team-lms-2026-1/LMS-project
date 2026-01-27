"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/qna-detail.module.css";
import { qnaApi } from "../api/qnaApi";
import type { QnaListItemDto } from "../api/dto";

export default function QnaDetailPage({ qnaId }: { qnaId: string }) {
  const router = useRouter();

  const [item, setItem] = useState<QnaListItemDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await qnaApi.get(qnaId);
      setItem(data);
    } catch (e: any) {
      setError(e?.message ?? "Q&A 상세 조회 실패");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qnaId]);

  const onDelete = async () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    try {
      await qnaApi.remove(qnaId);
      router.push("/admin/community/qna");
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!item) return <div className={styles.wrap}>{error ?? "Q&A를 찾을 수 없습니다."}</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>커뮤니티 - Q&amp;A - 상세(수정/삭제)</div>
      <div className={styles.pageTitle}>Q&amp;A</div>

      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.category}>{item.category}</div>
          <div className={styles.title}>{item.title}</div>
        </div>

        <div className={styles.meta}>
          <div>작성일: {item.createdAt ?? "-"}</div>
          <div>조회수: {Number(item.views ?? 0).toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{item.content ?? ""}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push(`/admin/community/qna/${qnaId}/edit`)}>
          수정
        </button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onDelete}>
          삭제
        </button>
      </div>
    </div>
  );
}
