"use client";

import { useCallback, useEffect, useState } from "react";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useI18n } from "@/i18n/useI18n";
import { useRouter } from "next/navigation";
import { useExtraCurricularOfferingList } from "../../hooks/useExtraCurricularOfferingList";
import { StudentExtraCurricularOfferingsTable } from "./StudentExtraCurricularOfferingTable";
import styles from "./StudentExtraCurricularOfferingPage.module.css";

export default function StudentExtraCurricularOfferingPageClient() {
  const router = useRouter();
  const { state, actions } = useExtraCurricularOfferingList();
  const t = useI18n("extraCurricular.studentOfferings");

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
            />
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudentExtraCurricularOfferingsTable
          items={state.items}
          loading={state.loading}
          onRowClick={(row) => router.push(`/student/extra-curricular/offerings/${row.extraOfferingId}`)}
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
