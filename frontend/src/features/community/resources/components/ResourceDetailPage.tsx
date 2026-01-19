"use client";

import { useRouter } from "next/navigation";
import styles from "../styles/resource-detail.module.css";
import { mockResources } from "../data/mockResources";
import type { ResourceCategory } from "../types";

function badgeClass(category: ResourceCategory, s: Record<string, string>) {
  switch (category) {
    case "서비스":
      return `${s.badge} ${s.badgeService}`;
    case "학사":
      return `${s.badge} ${s.badgeAcademic}`;
    case "행사":
      return `${s.badge} ${s.badgeEvent}`;
    default:
      return `${s.badge} ${s.badgeNormal}`;
  }
}

export default function ResourceDetailPage({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const item = mockResources.find((n) => n.id === resourceId);

  if (!item) return <div className={styles.wrap}>자료를 찾을 수 없습니다.</div>;

  const onDelete = () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;
    router.push("/community/resources");
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>커뮤니티 &gt; 자료실 &gt; 상세페이지(수정 / 삭제)</div>

      <div className={styles.h1Row}>
        <h1 className={styles.h1}>자료실</h1>
      </div>

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

        <div className={styles.attach}>
          <div className={styles.attachLabel}>첨부<br />파일</div>
          <div className={styles.attachValue}>{item.attachment?.name ?? "-"}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push(`/community/resources/${item.id}/edit`)}
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
