"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-list.module.css";
import { resourcesApi } from "../api/resourcesApi";
import type { ResourceListItemDto } from "../api/dto";
import { resourceCategoriesApi } from "../categories/api/resourceCategoriesApi";
import type { ResourceCategoryDto } from "../categories/api/dto";

type CategoryFilterValue = "ALL" | string; // ✅ select는 string 기반

function CategoryBadge({ name, bgColor, textColor }: { name: string; bgColor: string; textColor: string }) {
  return (
    <span className={styles.badge} style={{ backgroundColor: bgColor, color: textColor }}>
      {name}
    </span>
  );
}

export default function ResourceListPage() {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState<CategoryFilterValue>("ALL");
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState<ResourceListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<ResourceCategoryDto[]>([]);
  const categoryMap = useMemo(() => {
    const m = new Map<string, ResourceCategoryDto>();
    categories.forEach((c) => m.set(String(c.categoryId), c));
    return m;
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const data = await resourceCategoriesApi.list({ page: 0, size: 200 });
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const cid = categoryId === "ALL" ? undefined : Number(categoryId);
      const params =
        cid && Number.isFinite(cid) ? { categoryId: cid, keyword, page: 0, size: 20 } : { keyword, page: 0, size: 20 };

      const data = await resourcesApi.list(params);
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "자료실 목록 조회 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return rows.filter((r) => {
      const cOk =
        categoryId === "ALL" ? true : String(r.categoryId) === String(categoryId);
      const kOk =
        kw.length === 0 ? true : (r.title ?? "").toLowerCase().includes(kw);
      return cOk && kOk;
    });
  }, [rows, categoryId, keyword]);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>&gt;</span>
        <strong>자료실 관리</strong>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>자료실</div>

        <div className={styles.filters}>
          <select className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="ALL">전체</option>
            {categories.map((c) => (
              <option key={String(c.categoryId)} value={String(c.categoryId)}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className={styles.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력..."
          />

          <button className={styles.searchBtn} onClick={fetchList} disabled={loading}>
            검색
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colNo}>번호</th>
              <th className={styles.colCategory}>분류</th>
              <th>제목</th>
              <th className={styles.colViews}>조회수</th>
              <th className={styles.colDate}>작성일</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: "center", color: "#777" }}>
                  불러오는 중...
                </td>
              </tr>
            )}

            {!loading &&
              filteredRows.map((row, idx) => {
                const c = categoryMap.get(String(row.categoryId));
                const badgeName = row.categoryName ?? c?.name ?? "-";
                const bg = c?.bgColorHex ?? "#64748b";
                const tc = c?.textColorHex ?? "#ffffff";

                return (
                  <tr
                    key={String(row.id)}
                    className={styles.row}
                    onClick={() => router.push(`/admin/community/resources/${row.id}`)}
                  >
                    <td className={styles.colNo}>{row.no ?? String(idx + 1).padStart(5, "0")}</td>
                    <td className={styles.colCategory}>
                      <CategoryBadge name={badgeName} bgColor={bg} textColor={tc} />
                    </td>
                    <td>{row.title}</td>
                    <td className={styles.colViews}>{Number(row.views ?? 0).toLocaleString()}</td>
                    <td className={styles.colDate}>{row.createdAt ?? "-"}</td>
                  </tr>
                );
              })}

            {!loading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: "center", color: "#777" }}>
                  {error ? error : "검색 결과가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <button className={styles.leftBtn} onClick={() => router.push("/admin/community/resources/categories")}>
          카테고리 관리
        </button>

        <div className={styles.pagination}>
          <button className={`${styles.pageBtn} ${styles.pageBtnDisabled}`} disabled>
            ‹
          </button>
          <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <span style={{ color: "#aaa", fontSize: 12 }}>…</span>
          <button className={styles.pageBtn}>9</button>
          <button className={styles.pageBtn}>10</button>
          <button className={styles.pageBtn}>›</button>
        </div>

        <button className={styles.rightBtn} onClick={() => router.push("/admin/community/resources/new")}>
          등록
        </button>
      </div>
    </div>
  );
}
