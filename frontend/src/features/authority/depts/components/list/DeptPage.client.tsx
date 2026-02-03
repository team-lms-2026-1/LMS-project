"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./DeptPage.module.css"
import { DeptsTable } from "./DeptTable";
import { OutButton } from "@/components/button/OutButton";
import { useDeptList } from "../../hooks/useDeptList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import DeptCreatePage from "../modal/DeptCreatePage";
import { updateDeptStatus } from "../../api/deptsApi";

export default function DeptPageClient() {
  const { state, actions } = useDeptList();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreated = async () => {
    await actions.reload();
    setPage(1);
  };
  const handleToggleStatus = async (deptId: number, nextActive: boolean) => {
    try {
      await updateDeptStatus(deptId, nextActive);
      await actions.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size]);

  // deptId 드롭다운 필터추가
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
              placeholder="학과코드/학과명 검색"
            />
          </div>
        </div>
        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <DeptsTable
          items={state.items}
          loading={state.loading}
          onEditClick={(id) => setEditId(id)}
          onToggleStatus={handleToggleStatus}
        />


        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
          <OutButton onClick={() => setIsModalOpen(true)}>
            교과등록
          </OutButton>
        </div>
      </div>
      {isModalOpen && (
        <DeptCreatePage
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}