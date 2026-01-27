"use client";

import { useCallback, useEffect, useState } from "react";
import { useSemestersList } from "@/features/authority/semesters/hooks/useSemesterList";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { SemestersTable } from "./SemestersTable";
import { SemesterCreateModal } from "../modal/SemesterCreateModal";
import styles from "./SemestersPage.client.module.css";
import { SemesterEditModal } from "../modal/SemesterEditModal";
import { OutButton } from "@/components/button/OutButton";

export default function SemestersPageClient() {
  const { state, actions } = useSemestersList();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleCreated = async () => {
    await actions.reload();
  };


  // URL 쿼리스트링 기반 page/size
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  // const [inputKeyword, setInputKeyword] = useState("");

  // pagination
  useEffect(() => {
    actions.goPage(page);

  }, [page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size]);

  // const handleSearch = useCallback(() => {
  //   setPage(1);
  //   actions.goPage(1);
  //   actions.setKeyword(inputKeyword)
  // }, [inputKeyword, setPage, actions]);
  
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>학기 관리</h1>

        {/* <SearchBar
          value={inputKeyword}
          onChange={setInputKeyword}
          onSearch={handleSearch}
          placeholder="학기명/코드 검색"
        /> */}

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <SemestersTable
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
          <OutButton onClick={() => setIsModalOpen(true)}>
            학기등록
          </OutButton>
        </div>

        {/* ✅ 항상 렌더 + open으로 제어 (팀 표준) */}
        <SemesterCreateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
        <SemesterEditModal
          open={Boolean(editId)}
          semesterId = {editId ?? undefined}
          onClose={() => setEditId(null)}
          onUpdated={ async () => {
            await actions.reload();
            setEditId(null)
          }}
        />
      </div>
    </div>
  );
}
