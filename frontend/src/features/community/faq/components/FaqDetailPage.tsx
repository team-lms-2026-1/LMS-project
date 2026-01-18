"use client";

import { useRouter } from "next/navigation";
import styles from "../styles/faq-detail.module.css";
import { mockFaqs } from "../data/mockFaqs";
import type { FaqCategory } from "../types";

function badgeClass(category: FaqCategory, s: Record<string, string>) {
  switch (category) {
    case "서비스":
      return `${s.badge} ${s.badgeService}`;
    case "학습":
      return `${s.badge} ${s.badgeStudy}`;
    case "정책":
      return `${s.badge} ${s.badgePolicy}`;
    default:
      return `${s.badge} ${s.badgeEtc}`;
  }
}

export default function FaqDetailPage({ faqId }: { faqId: string }) {
  const router = useRouter();
  const item = mockFaqs.find((f) => f.id === faqId);

  if (!item) return <div className={styles.wrap}>FAQ를 찾을 수 없습니다.</div>;

  const onDelete = () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;
    router.push("/community/faq");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>FAQ</span>
        <span>-</span>
        <span>상세페이지(수정 / 삭제)</span>
      </div>

      <div className={styles.pageTitle}>FAQ</div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={badgeClass(item.category, styles)}>{item.category}</span>
          <span className={styles.headTitle}>{item.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자: {item.author}</div>
          <div style={{ textAlign: "center" }}>작성일: {item.createdAt}</div>
          <div style={{ textAlign: "right" }}>조회수: {item.views.toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{item.content}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push(`/community/faq/${item.id}/edit`)}
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
