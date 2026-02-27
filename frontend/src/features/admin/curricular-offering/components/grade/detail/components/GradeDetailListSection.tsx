"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./GradeDetailListSection.module.css";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";

import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";

import { GradeDetailTable } from "./GradeDetailTable";
import { useCurricularGradeDetailList } from "@/features/admin/curricular-offering/hooks/useCurricularGradeList";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  studentAccountId: number;
};

export function GradeDetailListSection({ studentAccountId }: Props) {
  const t = useI18n("curricular.adminGrades.detail.list");
  const { state, actions } = useCurricularGradeDetailList({
    studentAccountId,
    enabled: true,
  });

  // URL query (semesterId)
  const { get } = useFilterQuery(["semesterId"]);
  const semesterId = get("semesterId");

  // pagination (page/size)
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  // search input (keyword)
  const [inputKeyword, setInputKeyword] = useState("");

  // sync page
  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  // sync size
  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  // sync semesterId (URL -> hook)
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
      <Header title={t("title")} />

      <div className={styles.body}>
        <div className={styles.searchRow}>
          {/* 학기 필터 */}
          <SemesterFilterDropdown />

          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{t("loadError")}</div>}

        <GradeDetailTable items={state.items} loading={state.loading} />

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

