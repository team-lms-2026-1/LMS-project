"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./QuestionPage.module.css";
import { QuestionTable } from "./QuestionTable";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useI18n } from "@/i18n/useI18n";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { fetchQnaCategories } from "../../api/qnaApi";
import type { Category } from "../../api/types";

export default function QuestionPageClient() {
  const { state, actions } = useQnaList();
  const t = useI18n("community.qna.professor.list");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");
  const { get, setFilters } = useFilterQuery(["categoryId"]);
  const categoryIdQs = get("categoryId");
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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchGroup}>
            <div className={styles.dropdownWrap}>
              <Dropdown
                value={categoryIdQs || ""}
                options={categoryOptions}
                placeholder={t("categoryAll")}
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
                placeholder={t("searchPlaceholder")}
              />
            </div>
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <QuestionTable items={state.items} loading={state.loading} />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
        </div>
      </div>
    </div>
  );
}
