"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./DignosisPage.module.css";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { useDignosisList } from "../../hooks/useDignosisList";
import type { DiagnosisListItemDto } from "../../api/types";
import { DignosisTable } from "./DignosisTable";

export default function DignosisPageClient() {
  const t = useI18n("competency.studentDiagnosis.list");
  const router = useRouter();
  const { state, actions } = useDignosisList();
  const { page, size, keyword, setPage, setKeyword } = useListQuery({
    defaultPage: 1,
    defaultSize: 10,
  });

  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [actions, page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [actions, size, state.size]);

  useEffect(() => {
    if (state.keyword !== keyword) actions.setKeyword(keyword ?? "");
  }, [actions, keyword, state.keyword]);

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
        <h1 className={styles.title}>{t("title")}</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder={t("searchPlaceholder")}
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
