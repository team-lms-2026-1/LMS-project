"use client";

import { useCallback, useEffect, useState } from "react";
import { QnaListItemDto, PageMeta } from "../api/types";
import { fetchQnaList } from "../api/qnaApi";

const defaultMeta: PageMeta = {
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    sort: [],
};

export function useQnaList() {
    const [items, setItems] = useState<QnaListItemDto[]>([]);
    const [meta, setMeta] = useState<PageMeta>(defaultMeta);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [keyword, setKeyword] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchQnaList({
                page,
                size,
                keyword: keyword || undefined,
            });

            setItems(res.data);
            setMeta(res.meta);
        } catch (e: any) {
            console.error("[useQnaList]", e);
            setError(e.message ?? "Q&A 목록 조회 실패");
            setItems([]);
            setMeta(defaultMeta);
        } finally {
            setLoading(false);
        }
    }, [page, size, keyword]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        state: {
            items,
            meta,
            page,
            size,
            keyword,
            loading,
            error,
        },
        actions: {
            setKeyword,
            search: () => setPage(1),
            goPage: (p: number) => setPage(p),
            setSize: (s: number) => {
                setPage(1);
                setSize(s);
            },
            reload: load,
        },
    };
}


