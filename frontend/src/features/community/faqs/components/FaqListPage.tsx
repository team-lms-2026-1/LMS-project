"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/faq-list.module.css";
import { faqsApi } from "../api/faqApi";
import type { FaqListItemDto } from "../api/dto";
import { faqCategoriesApi } from "../categories/api/faqCategoriesApi";
import type { FaqCategoryRow } from "../categories/types";

export default function FaqListPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<FaqCategoryRow[]>([]);
  const [categoryId, setCategoryId] = useState<number | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState<FaqListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = 0;
  const size = 20;

  const categoryById = useMemo(() => {
    const m = new Map<number, FaqCategoryRow>();
    for (const c of categories) m.set(Number(c.categoryId), c);
    return m;
  }, [categories]);

  const categoryByName = useMemo(() => {
    const m = new Map<string, FaqCategoryRow>();
    for (const c of categories) {
      if (!c?.name) continue;
      m.set(String(c.name), c);
    }
    return m;
  }, [categories]);

  const selectedCategoryName = useMemo(() => {
    if (categoryId === "ALL") return null;
    return categoryById.get(categoryId)?.name ?? null;
  }, [categoryId, categoryById]);

  const fetchCategories = async () => {
    try {
      const list = await faqCategoriesApi.list({ page: 0, size: 50 });
      setCategories(Array.isArray(list) ? (list as any) : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await faqsApi.list({
        categoryId: categoryId === "ALL" ? undefined : categoryId,
        keyword,
        page,
        size,
      });
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "FAQ 목록 조회 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCategories();
      await fetchList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return rows.filter((n) => {
      const categoryOk =
        categoryId === "ALL"
          ? true
          : selectedCategoryName
            ? String(n.categoryName ?? "") === selectedCategoryName
            : true;

      const keywordOk = kw.length === 0 ? true : String(n.title ?? "").toLowerCase().includes(kw);

      return categoryOk && keywordOk;
    });
  }, [rows, categoryId, keyword, selectedCategoryName]);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>&gt;</span>
        <strong>FAQ 관리</strong>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>FAQ</div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={categoryId === "ALL" ? "ALL" : String(categoryId)}
            onChange={(e) => setCategoryId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          >
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
          <colgroup>
            <col className={styles.colNoCol} />
            <col className={styles.colCategoryCol} />
            <col className={styles.colTitleCol} />
            <col className={styles.colViewsCol} />
            <col className={styles.colDateCol} />
          </colgroup>

          <thead>
            <tr>
              <th className={styles.colNo}>번호</th>
              <th className={styles.colCategory}>분류</th>
              <th className={styles.colTitle}>제목</th>
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
                const no = String(page * size + idx + 1).padStart(5, "0");
                const cat = categoryByName.get(String(row.categoryName ?? ""));

                return (
                  <tr
                    key={String(row.id)}
                    className={styles.row}
                    onClick={() => router.push(`/admin/community/faqs/${row.id}`)}
                  >
                    <td className={styles.colNo}>{no}</td>

                    <td className={styles.colCategory}>
                      <span
                        className={styles.badge}
                        style={{
                          backgroundColor: cat?.bgColor ?? "#F3F4F6",
                          color: cat?.textColor ?? "#111827",
                        }}
                        title={cat ? `bg: ${cat.bgColor}, text: ${cat.textColor}` : ""}
                      >
                        {cat?.name ?? row.categoryName ?? "미분류"}
                      </span>
                    </td>

                    <td className={`${styles.colTitle} ${styles.titleCell}`} title={row.title}>
                      {row.title}
                    </td>

                    <td className={styles.colViews}>{Number(row.views ?? 0).toLocaleString()}</td>
                    <td className={styles.colDate}>{row.createdAt}</td>
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
        <button className={styles.leftBtn} onClick={() => router.push("/admin/community/faqs/categories")}>
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

        <button className={styles.rightBtn} onClick={() => router.push("/admin/community/faqs/new")}>
          등록
        </button>
      </div>
    </div>
  );
}
