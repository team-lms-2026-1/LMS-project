"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/faq-detail.module.css";
import { faqsApi } from "../api/faqApi";
import type { FaqDetailDto } from "../api/dto";
import { faqCategoriesApi } from "../categories/api/faqCategoriesApi";
import type { FaqCategoryRow } from "../categories/types";

export default function FaqDetailPage({ faqId }: { faqId: string }) {
  const router = useRouter();

  const [faq, setFaq] = useState<FaqDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<FaqCategoryRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await faqCategoriesApi.list({ page: 0, size: 50 });
        setCategories(Array.isArray(list) ? (list as any) : []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const categoryMap = useMemo(() => {
    const m = new Map<string, FaqCategoryRow>();
    for (const c of categories) m.set(String(c.name), c);
    return m;
  }, [categories]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await faqsApi.detail(faqId);
        setFaq(data);
      } catch (e: any) {
        setError(e?.message ?? "FAQ 조회 실패");
        setFaq(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [faqId]);

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (error) return <div className={styles.wrap}>{error}</div>;
  if (!faq) return <div className={styles.wrap}>FAQ를 찾을 수 없습니다.</div>;

  const cat = categoryMap.get(String(faq.categoryName ?? ""));

  const onDelete = async () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    try {
      await faqsApi.remove(String(faq.id));
      router.push("/admin/community/faqs");
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <strong>FAQ</strong>
        <span>-</span>
        <span>상세페이지(수정 / 삭제)</span>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.pageTitle}>FAQ</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span
            className={styles.badge}
            style={{
              backgroundColor: cat?.bgColor ?? "#F3F4F6",
              color: cat?.textColor ?? "#111827",
            }}
          >
            {cat?.name ?? faq.categoryName ?? "미분류"}
          </span>
          <span className={styles.headTitle}>{faq.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자: {faq.authorName || "-"}</div>
          <div style={{ textAlign: "center" }}>작성일: {faq.createdAt}</div>
          <div style={{ textAlign: "right" }}>조회수: {Number(faq.views ?? 0).toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{faq.content}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push(`/admin/community/faqs/${faq.id}/edit`)}
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
