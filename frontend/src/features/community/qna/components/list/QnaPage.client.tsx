"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./QnaPage.module.css";
import { QnaTable } from "./QnaTablePage";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";

import { fetchQnaCategories } from "../../api/QnasApi";
import type { Category } from "../../api/types";

export default function QnaPageClient() {
  const router = useRouter();
  const { state, actions } = useQnaList();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const { get, setFilters } = useFilterQuery(["categoryId"]);
  const categoryIdQs = get("categoryId");

  const [inputKeyword, setInputKeyword] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      setCatsLoading(true);
      try {
        const res = await fetchQnaCategories();
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
    setPage(1);
    setFilters({ categoryId: nextValue || null });
  };

  const goCategories = () => {
    router.push("/admin/community/qna/categories");
  };

  const handleDelete = useCallback(
    async (questionId: number) => {
      const ok = confirm("이 질문을 삭제할까요?");
      if (!ok) return;

      try {
        await actions.deleteQuestion(questionId);
        await actions.reload();
      } catch (e: any) {
        alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
      }
    },
    [actions]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Q&A</h1>

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

        <QnaTable items={state.items} loading={state.loading} onDeleteClick={handleDelete} />

        <div className={styles.footerRow}>
          <div className={styles.footerLeft}>
            <Button variant="secondary" onClick={goCategories}>
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

          <div className={styles.footerRight} />
        </div>
      </div>
    </div>
  );
}
