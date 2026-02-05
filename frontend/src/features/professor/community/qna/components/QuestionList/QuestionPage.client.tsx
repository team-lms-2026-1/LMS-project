"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./QuestionPage.module.css"
import { QuestionTable } from "./QuestionTable";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";

export default function QuestionPageClient() {
    const { state, actions } = useQnaList();

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
                <h1 className={styles.title}>Q&A</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchBarWrap}>
                        <SearchBar
                            value={inputKeyword}
                            onChange={setInputKeyword}
                            onSearch={handleSearch}
                            placeholder="제목 검색"
                        />
                    </div>
                    {/* 교수는 작성 버튼 없음 */}
                </div>
                {state.error && <div className={styles.errorMessage}>{state.error}</div>}

                <QuestionTable
                    items={state.items}
                    loading={state.loading}
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
