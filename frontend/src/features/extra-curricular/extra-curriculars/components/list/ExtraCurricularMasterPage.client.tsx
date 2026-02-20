"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./ExtraCurricularMasterPage.module.css"
import { OutButton } from "@/components/button/OutButton";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useExtraCurricularMasterList } from "../../hooks/useExtraCurricularMaster";
import { ExtraCurricularMasterTable } from "./ExtraCurricularMasterTable";
import { ExtraCurricularCreateModal } from "../modal/ExtraCurricularCreateModal";
import { ExtraCurricularEditModal } from "../modal/ExtraCurricularEditModal";
import { useI18n } from "@/i18n/useI18n";

export default function ExtraCurricularMasterPageClient() {
  const { state, actions } = useExtraCurricularMasterList();
  const t = useI18n("extraCurricular.adminPrograms");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreated = async () => {
    await actions.reload();
  };

  // pagination + search

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

        <ExtraCurricularMasterTable
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
            {t("registerButton")}
          </OutButton>
        </div>
        <ExtraCurricularCreateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
        <ExtraCurricularEditModal
          open={Boolean(editId)}
          extraCurricularId={editId ?? undefined}
          onClose={() => setEditId(null)}
          onUpdated={async () => {
            await actions.reload();
            setEditId(null);
          }}
        />
      </div>

    </div>
  )
}
