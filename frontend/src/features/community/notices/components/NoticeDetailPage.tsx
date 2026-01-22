"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/notice-detail.module.css";
import type { NoticeCategory } from "../types";
import { noticesApi } from "../api/noticesApi";
import type { NoticeDetailDto } from "../api/dto";

function badgeClass(category: NoticeCategory, stylesObj: Record<string, string>) {
  switch (category) {
    case "서비스":
      return `${stylesObj.badge} ${stylesObj.badgeService}`;
    case "학사":
      return `${stylesObj.badge} ${stylesObj.badgeAcademic}`;
    case "행사":
      return `${stylesObj.badge} ${stylesObj.badgeEvent}`;
    default:
      return `${stylesObj.badge} ${stylesObj.badgeNormal}`;
  }
}

export default function NoticeDetailPage({ noticeId }: { noticeId: string }) {
  const router = useRouter();

  const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await noticesApi.detail(noticeId);
        setNotice(data);
      } catch (e: any) {
        setError(e?.message ?? "공지사항 조회 실패");
        setNotice(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [noticeId]);

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (error) return <div className={styles.wrap}>{error}</div>;
  if (!notice) return <div className={styles.wrap}>공지사항을 찾을 수 없습니다.</div>;

  const onDelete = async () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    try {
      await noticesApi.remove(String(notice.id));
      router.push("/community/notices");
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <strong>공지사항</strong>
        <span>-</span>
        <span>상세페이지(수정 / 삭제)</span>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.pageTitle}>공지사항</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={badgeClass(notice.category, styles)}>{notice.category}</span>
          <span className={styles.headTitle}>{notice.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자: {notice.author ?? "-"}</div>
          <div style={{ textAlign: "center" }}>작성일: {notice.createdAt}</div>
          <div style={{ textAlign: "right" }}>조회수: {Number(notice.views ?? 0).toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{notice.content}</div>
        </div>

        <div className={styles.attach}>
          <div className={styles.attachLabel}>첨부<br />파일</div>
          <div className={styles.attachValue}>{notice.attachment?.name ?? "-"}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push(`/community/notices/${notice.id}/edit`)}
        >
          수정
        </button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onDelete}>
          삭제
        </button>
      </div>
    </div>
  );
}
