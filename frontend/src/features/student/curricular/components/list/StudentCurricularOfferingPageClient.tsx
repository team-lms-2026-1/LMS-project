"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./StudentCurricularOfferingPageClient.module.css"
import { StudentCurricularOfferingsTable } from "./StudentCurricularOfferingsTable";
import { useCurricularOfferingsList } from "../../hooks/useCurricularOfferingList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useRouter } from "next/navigation";

export default function StudentCurricularOfferingPageClient() {
  const router = useRouter();
  const { state, actions } = useCurricularOfferingsList();

  // pagination + search

  const { get } = useFilterQuery(["semesterId"])
  const semesterId = get("semesterId")

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size]);

  useEffect(() => {
    actions.setSemesterId(semesterId ? Number(semesterId) : null);
  }, [semesterId, actions]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword)
  }, [inputKeyword, setPage, actions]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>교과 신청</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="교과운영명/코드 검색"
            />
          </div>
        </div>
        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudentCurricularOfferingsTable
          items={state.items}
          loading={state.loading}
        //   onEditClick={(id) => setEditId(id)}
          onRowClick={(row) => router.push(`/student/curricular/offerings/${row.offeringId}`)}
        />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
        </div>
        {/* <CurricularEditModal
          open={Boolean(editId)}
          curricularId = {editId ?? undefined}
          onClose={() => setEditId(null)}
          onUpdated={ async () => {
            await actions.reload();
            setEditId(null)
          }}
        /> */}
      </div>

    </div>
  )
}
