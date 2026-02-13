"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./DignosisPage.module.css";
import { DignosisTable } from "./DignosisTable";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useDignosisList } from "../../hooks/useDignosisList";
import { useRouter } from "next/navigation";
import type { DiagnosisListItemDto } from "../../api/types";

export default function DignosisPageClient() {
  const router = useRouter();
  const { state, actions } = useDignosisList();
  const { page, size, keyword, setPage, setKeyword } = useListQuery({
    defaultPage: 1,
    defaultSize: 10,
  });

  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size]);

  useEffect(() => {
    if (state.keyword !== keyword) actions.setKeyword(keyword ?? "");
  }, [keyword, state.keyword]);

  useEffect(() => {
    setInputKeyword(keyword ?? "");
  }, [keyword]);

  const handleSearch = useCallback(() => {
    setKeyword(inputKeyword);
  }, [inputKeyword, setKeyword]);

  const handleRowClick = useCallback(
    (row: DiagnosisListItemDto) => {
      router.push(`/student/competencies/dignosis/${row.diagnosisId}`);
    },
    [router]
  );

  const displayItems = useMemo(() => {
    const total = state.meta.totalElements ?? state.items.length;
    const offset = (state.page - 1) * state.size;
    return state.items.map((item, index) => ({
      ...item,
      displayNo: Math.max(1, total - (offset + index)),
    }));
  }, [state.items, state.meta.totalElements, state.page, state.size]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>역량 진단서</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="검색어"
              onClear={() => setKeyword("")}
            />
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <DignosisTable
          items={displayItems}
          loading={state.loading}
          onRowClick={handleRowClick}
        />

        <div className={styles.footerRow}>
          <div className={styles.footerCenter}>
            <PaginationSimple
              page={page}
              totalPages={state.meta.totalPages}
              onChange={setPage}
              disabled={state.loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
