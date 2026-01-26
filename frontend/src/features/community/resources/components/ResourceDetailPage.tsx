"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-detail.module.css";
import type { ResourceItem } from "../types";
import { resourcesApi } from "../api/resourcesApi";
import { resourceCategoriesApi } from "../categories/api/resourceCategoriesApi";
import type { ResourceCategoryDto } from "../categories/api/dto";

function CategoryBadge({ name, bgColor, textColor }: { name: string; bgColor: string; textColor: string }) {
  return (
    <span className={styles.badge} style={{ backgroundColor: bgColor, color: textColor }}>
      {name}
    </span>
  );
}

export default function ResourceDetailPage({ resourceId }: { resourceId: string }) {
  const router = useRouter();

  const [item, setItem] = useState<ResourceItem | null>(null);
const [categories, setCategories] = useState<ResourceCategoryDto[]>([]);
  const categoryMap = useMemo(() => {
    const m = new Map<string, ResourceCategoryDto>();
    categories.forEach((c) => m.set(String(c.categoryId), c));
    return m;
  }, [categories]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await resourceCategoriesApi.list({ page: 0, size: 200 });
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourcesApi.get(resourceId);
      setItem(data); // ✅ ResourceItem(content optional)로 안전하게 들어감
    } catch (e: any) {
      setError(e?.message ?? "자료 상세 조회 실패");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  const onDelete = async () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    try {
      await resourcesApi.remove(resourceId);
      router.push("/admin/community/resources");
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!item) return <div className={styles.wrap}>{error ?? "자료를 찾을 수 없습니다."}</div>;

  // ✅ number/string 비교 경고 방지: String으로 통일
  const c = categoryMap.get(String(item.categoryId));
  const badgeName = item.categoryName ?? c?.name ?? "-";
  const bg = c?.bgColorHex ?? "#64748b";
  const tc = c?.textColorHex ?? "#ffffff";

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
          <CategoryBadge name={badgeName} bgColor={bg} textColor={tc} />
          <span className={styles.headTitle}>{item.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자: {item.author ?? "-"}</div>
          <div style={{ textAlign: "center" }}>작성일: {item.createdAt ?? "-"}</div>
          <div style={{ textAlign: "right" }}>조회수: {Number(item.views ?? 0).toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          {/* ✅ content가 없을 수 있으므로 안전 처리 */}
          <div className={styles.content}>{item.content ?? ""}</div>
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
          onClick={() => router.push(`/admin/community/resources/${resourceId}/edit`)}
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
