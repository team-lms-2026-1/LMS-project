"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./CurricularsPage.module.css"
import { CurricularsTable } from "./CurricularsTable";
import { OutButton } from "@/components/button/OutButton";
import { useCurricularsList } from "../../hooks/useCurricularList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";

export default function CurricularPageClient() {
  const { state, actions } = useCurricularsList();
  const [editId, setEditId] = useState<number | null>(null);

  // pagination + search

  const { get } = useFilterQuery(["deptId"])
  const deptId = get("deptId")

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size]);

  // deptId 드롭다운 필터추가
  useEffect(() => {
    actions.setDeptId(deptId ? Number(deptId) : null);
  }, [deptId, actions]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword)
  }, [inputKeyword, setPage, actions]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>교과 관리</h1>

        <div className={styles.searchRow}>
          <DeptFilterDropdown />
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="학기명/코드 검색"
            />
          </div>
        </div>
        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <CurricularsTable
          items={state.items}
          loading={state.loading}
          onEditClick={(id) => setEditId(id)}
        />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
          <OutButton>
            교과등록
          </OutButton>
        </div>
        
      </div>

    </div>
  )
}