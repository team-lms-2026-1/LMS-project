"use client";

import { useCallback, useEffect, useState } from "react";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useI18n } from "@/i18n/useI18n";
import { useCurricularGradeMeList } from "../../../hooks/useCurricularGradeReports";
import { GradeDetailMeTable } from "./GradeDetailMeTable";
import styles from "./GradeListMeSection.module.css";

export function GradeListMeSection() {
  const t = useI18n("curricular.adminGrades.detail.list");
  const { state, actions } = useCurricularGradeMeList();

  const { get } = useFilterQuery(["semesterId"]);
  const semesterId = get("semesterId");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
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
      <Header title={t("title")} />

      <div className={styles.body}>
        <div className={styles.searchRow}>
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

        <GradeDetailMeTable items={state.items} loading={state.loading} />

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
