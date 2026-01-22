"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-detail.module.css";
import type { ResourceCategory, ResourceItem } from "../types";
import { resourcesApi } from "../api/resourcesApi";

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

  const [item, setItem] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourcesApi.get(resourceId);
      setItem(data);
    } catch (e: any) {
      setError(e?.message ?? "자료 상세 조회 실패");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  const onDelete = async () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    try {
      await resourcesApi.remove(resourceId);
      // ✅ 현재 app 라우트가 /admin/community/resoures 기준
      router.push("/admin/community/resoures");
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!item) return <div className={styles.wrap}>{error ?? "자료를 찾을 수 없습니다."}</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>자료실</span>
        <span>-</span>
        <span>상세페이지(수정 / 삭제)</span>
      </div>

      <div className={styles.pageTitle}>자료실</div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={badgeClass(item.category, styles)}>{item.category}</span>
          <span className={styles.headTitle}>{item.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자: {item.author}</div>
          <div style={{ textAlign: "center" }}>작성일: {item.createdAt}</div>
          <div style={{ textAlign: "right" }}>조회수: {Number(item.views ?? 0).toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{item.content}</div>
        </div>

        <div className={styles.attach}>
          <div className={styles.attachLabel}>
            첨부<br />파일
          </div>
          <div className={styles.attachValue}>{item.attachment?.name ?? "-"}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push(`/admin/community/resoures/${resourceId}/edit`)}
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
