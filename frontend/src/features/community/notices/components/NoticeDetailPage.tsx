"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/notice-detail.module.css";
import { noticesApi } from "../api/noticesApi";
import type { NoticeDetailDto } from "../api/dto";
import { noticeCategoriesApi } from "../categories/api/noticeCategoriesApi";
import type { NoticeCategoryRow } from "../categories/types";

export default function NoticeDetailPage({ noticeId }: { noticeId: string }) {
  const router = useRouter();

  const [notice, setNotice] = useState<NoticeDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<NoticeCategoryRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await noticeCategoriesApi.list({ page: 0, size: 50 });
        setCategories(Array.isArray(list) ? list : []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const categoryMap = useMemo(() => {
    const m = new Map<number, NoticeCategoryRow>();
    for (const c of categories) m.set(Number(c.categoryId), c);
    return m;
  }, [categories]);

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

  const cat = categoryMap.get(Number(notice.categoryName));

  const onDelete = async () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    try {
      await noticesApi.remove(String(notice.id));
      router.push("/admin/community/notices");
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
          <span
            className={styles.badge}
            style={{
              backgroundColor: cat?.bgColor ?? "#F3F4F6",
              color: cat?.textColor ?? "#111827",
            }}
            title={cat ? `bg: ${cat.bgColor}, text: ${cat.textColor}` : ""}
          >
            {cat?.name ?? notice.categoryName ?? "미분류"}
          </span>
          <span className={styles.headTitle}>{notice.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자: {notice.authorName || "-"}</div>
          <div style={{ textAlign: "center" }}>작성일: {notice.createdAt}</div>
          <div style={{ textAlign: "right" }}>조회수: {Number(notice.views ?? 0).toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{notice.content}</div>
        </div>

        <div className={styles.attach}>
          <div className={styles.attachLabel}>
            첨부
            <br />
            파일
          </div>
          <div className={styles.attachValue}>{notice.files?.length ? `${notice.files.length}개` : "-"}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push(`/admin/community/notices/${notice.id}/edit`)}
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
