"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./NoticePage.module.css"
import { NoticesTable } from "./NoticeTablePage";
import { useNoticesList } from "../../hooks/useNoticeList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useI18n } from "@/i18n/useI18n";


export default function NoticePageClient() {
  const { state, actions } = useNoticesList();
  const t = useI18n("community.notices.student.list");
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

        <NoticesTable
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
        </div>
      </div>

    </div>
  )
}
