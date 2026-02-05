"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./ResourcePage.module.css";
import { ResourcesTable } from "./ResourceTablePage";
import { useResourcesList } from "../../hooks/useResourceList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";

// ✅ FAQ/공지사항/QnA와 동일
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";

import { fetchResourceCategories } from "../../api/ResourcesApi";
import type { Category } from "../../api/types";

export default function ResourcePageClient() {
  const router = useRouter();
  const { state, actions } = useResourcesList();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  // ✅ URL filter
  const { get, setFilters } = useFilterQuery(["categoryId"]);
  const categoryIdQs = get("categoryId");

  const [inputKeyword, setInputKeyword] = useState("");

  // ✅ 카테고리 드롭다운 데이터
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      setCatsLoading(true);
      try {
        const res = await fetchResourceCategories();
        if (!alive) return;
        setCategories(res.data ?? []);
      } finally {
        if (alive) setCatsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ URL categoryId -> hook 반영
  useEffect(() => {
    const v = categoryIdQs ? Number(categoryIdQs) : null;
    actions.setCategoryId(v);
  }, [categoryIdQs, actions]);

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ value: String(c.categoryId), label: c.name }));
  }, [categories]);

  const onChangeCategory = (nextValue: string) => {
    // ✅ 필터 변경 시 page=1로 리셋(중요)
    setPage(1);
    setFilters({ categoryId: nextValue || null });
  };

  const goCreate = () => router.push("/admin/community/resources/new");
  const goCategoryManage = () => router.push("/admin/community/resources/categories");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>자료실</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchGroup}>
            <div className={styles.dropdownWrap}>
              <Dropdown
                value={categoryIdQs || ""}
                options={categoryOptions}
                placeholder="전체"
                loading={catsLoading}
                disabled={catsLoading}
                onChange={onChangeCategory}
              />
            </div>

            <div className={styles.searchBarWrap}>
              <SearchBar
                value={inputKeyword}
                onChange={setInputKeyword}
                onSearch={handleSearch}
                placeholder="제목 검색"
              />
            </div>
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <ResourcesTable items={state.items} loading={state.loading} onReload={actions.reload} />

        <div className={styles.footerRow}>
          <div className={styles.footerLeft}>
            <Button variant="secondary" onClick={goCategoryManage}>
              카테고리 관리
            </Button>
          </div>

          <div className={styles.footerCenter}>
            <PaginationSimple
              page={page}
              totalPages={state.meta.totalPages}
              onChange={setPage}
              disabled={state.loading}
            />
          </div>

          <div className={styles.footerRight}>
            <Button variant="primary" onClick={goCreate}>
              등록
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
