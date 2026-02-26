"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./FaqPage.module.css";
import { FaqTable } from "./FaqTablePage";
import { useFaqList } from "../hooks/useFaqList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useI18n } from "@/i18n/useI18n";

export default function FaqPageClient() {
    const { state, actions } = useFaqList();
    const t = useI18n("community.faqs.professor.list");

    const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
    const [inputKeyword, setInputKeyword] = useState("");

    useEffect(() => {
        actions.goPage(page);
    }, [page, actions]);

    useEffect(() => {
        if (state.size !== size) actions.setSize(size);
    }, [size, state.size, actions]);

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

                <FaqTable items={state.items} loading={state.loading} />

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