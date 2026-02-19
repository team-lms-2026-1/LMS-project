"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { useI18n } from "@/i18n/useI18n";
import { useCurricularOfferingsList } from "../../hooks/useCurricularOfferingList";
import { ProfessorCurricularOfferingsTable } from "./ProfessorCurricularOfferingsTable";
import styles from "./ProfessorCurricularOfferingsPage.module.css";

export default function ProfessorCurricularOfferingsPageClient() {
  const router = useRouter();
  const { state, actions } = useCurricularOfferingsList();
  const t = useI18n("curricular.professorOfferings");

  const { get } = useFilterQuery(["semesterId"]);
  const semesterId = get("semesterId");
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [actions, page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [actions, size, state.size]);

  useEffect(() => {
    actions.setSemesterId(semesterId ? Number(semesterId) : null);
  }, [actions, semesterId]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [actions, inputKeyword, setPage]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

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

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <ProfessorCurricularOfferingsTable
          items={state.items}
          loading={state.loading}
          onRowClick={(row) => router.push(`/professor/curricular/offerings/${row.offeringId}`)}
        />

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
