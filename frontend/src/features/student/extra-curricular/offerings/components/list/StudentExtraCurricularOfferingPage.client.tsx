"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./StudentExtraCurricularOfferingPage.module.css"
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useRouter } from "next/navigation";
import { useExtraCurricularOfferingList } from "../../hooks/useExtraCurricularOfferingList";
import { StudentExtraCurricularOfferingsTable } from "./StudentExtraCurricularOfferingTable";

export default function StudentExtraCurricularOfferingPageClient() {
  const router = useRouter();
  const { state, actions } = useExtraCurricularOfferingList();

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

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword)
  }, [inputKeyword, setPage, actions]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>비교과신청</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="비교과운영명/코드 검색"
            />
          </div>
        </div>
        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudentExtraCurricularOfferingsTable
          items={state.items}
          loading={state.loading}
        //   onEditClick={(id) => setEditId(id)}
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