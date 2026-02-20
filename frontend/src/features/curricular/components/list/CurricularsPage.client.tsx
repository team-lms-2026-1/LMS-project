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
import { CurricularCreateModal } from "../modal/CurricularCreateModal";
import { CurricularEditModal } from "../modal/CurricularEditModal";
import { useI18n } from "@/i18n/useI18n";

export default function CurricularPageClient() {
  const { state, actions } = useCurricularsList();
  const t = useI18n("curricular.adminCurriculars");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreated = async () => {
    await actions.reload();
  };

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

  // deptId 드롭다운 필터 적용
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
          <OutButton onClick={() => setIsModalOpen(true)}>
            {t("registerButton")}
          </OutButton>
        </div>
        <CurricularCreateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
        <CurricularEditModal
          open={Boolean(editId)}
          curricularId={editId ?? undefined}
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


