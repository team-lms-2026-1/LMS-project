"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./ExtraCurricularGradePage.module.css";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useRouter } from "next/navigation";
import { useExtraCurricularGradeList } from "../../hooks/useExtraCurricularGradeList";
import { ExtraCurricularGradeTable } from "./ExtraCurricularGradeTable";
import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { useI18n } from "@/i18n/useI18n";

export default function ExtraCurricularGradePageClient() {
  const router = useRouter();
  const { state, actions } = useExtraCurricularGradeList();
  const t = useI18n("extraCurricular.adminGrades");

  const { get } = useFilterQuery(["deptId"]);
  const deptId = get("deptId");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  useEffect(() => {
    actions.setDeptId(deptId ? Number(deptId) : null);
  }, [deptId, actions]);

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
          <DeptFilterDropdown />
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

        <ExtraCurricularGradeTable
          items={state.items}
          loading={state.loading}
          onRowClick={(row) => router.push(`/admin/extra-curricular/grade-reports/${row.studentAccountId}`)}
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
