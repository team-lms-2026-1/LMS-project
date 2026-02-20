"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./ExtraCurricularOfferingPage.module.css"
import { OutButton } from "@/components/button/OutButton";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useRouter } from "next/navigation";
import { useExtraCurricularOfferingList } from "../../hooks/useExtraCurricularOfferingList";
import { ExtraCurricularOfferingTable } from "./ExtraCurricularOfferingTable";
import { ExtraCurricularOfferingCreateModal } from "./components/ExtraCurricularOfferingCreateModal";
import { useI18n } from "@/i18n/useI18n";

export default function ExtraCurricularOfferingPageClient() {
  const router = useRouter();
  const { state, actions } = useExtraCurricularOfferingList();
  const t = useI18n("extraCurricular.adminOfferings");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreated = async () => {
    await actions.reload();
  };

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

        <ExtraCurricularOfferingTable
          items={state.items}
          loading={state.loading}
        //   onEditClick={(id) => setEditId(id)}
          onRowClick={(row) => router.push(`/admin/extra-curricular/offerings/${row.extraOfferingId}`)}
        />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
          <OutButton onClick={() => setIsModalOpen(true)}>
            {t("registerButton")}
          </OutButton>
        </div>
        <ExtraCurricularOfferingCreateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
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
