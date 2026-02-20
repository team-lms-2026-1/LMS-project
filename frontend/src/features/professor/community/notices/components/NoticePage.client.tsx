"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./NoticePage.module.css"
import { NoticesTable } from "./NoticeTablePage";
// Professor Hook Import
import { useNoticesList } from "../hooks/useNoticeList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";

export default function NoticePageClient() {
    const { state, actions } = useNoticesList();
    // 교수는 공지사항 작성/수정 기능이 없어서 관리 state는 미사용
    // const [editId, setEditId] = useState<number | null>(null);

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
                <h1 className={styles.title}>공지사항</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchBarWrap}>
                        <SearchBar
                            value={inputKeyword}
                            onChange={setInputKeyword}
                            onSearch={handleSearch}
                            placeholder="제목 검색"
                        />
                    </div>
                </div>
                {state.error && <div className={styles.errorMessage}>{state.error}</div>}

                <NoticesTable
                    items={state.items}
                    loading={state.loading}
                    onEditClick={() => { }} // 수정 불가
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
