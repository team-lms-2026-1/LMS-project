"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./ExtraGradeDetailListSection.module.css";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";

import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";

import { ExtraCompletionDetailTable } from "./ExtraCompletionDetailTable";
import { useExtraCurricularGradeDetailList } from "@/features/extra-curricular/offerings/hooks/useExtraCurricularGradeList";

type Props = {
  studentAccountId: number;
};

export function ExtraGradeDetailListSection({ studentAccountId }: Props) {
  const { state, actions } = useExtraCurricularGradeDetailList({
    studentAccountId,
    enabled: true,
  });

  const { get } = useFilterQuery(["semesterId"]);
  const semesterId = get("semesterId");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 7 });
  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  useEffect(() => {
    actions.setSemesterId(semesterId ? Number(semesterId) : null);
  }, [semesterId, actions]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  return (
    <div className={styles.section}>
      <Header title="비교과 수료 리스트" />

      <div className={styles.body}>
        <div className={styles.searchRow}>
          <SemesterFilterDropdown />

          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="비교과명/코드 검색"
            />
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <ExtraCompletionDetailTable items={state.items} loading={state.loading} />

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

function Header({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>{title}</div>
    </div>
  );
}
