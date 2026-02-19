"use client";

import { useCallback, useEffect, useState } from "react";
import { FaqListItemDto, PageMeta } from "../api/types";
import { fetchFaqList } from "../api/faqsApi";

const defaultMeta: PageMeta = {
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    sort: [],
};

export function useFaqList() {
    const [items, setItems] = useState<FaqListItemDto[]>([]);
    const [meta, setMeta] = useState<PageMeta>(defaultMeta);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchFaqList({
                page,
                size,
                keyword: keyword || undefined,
                categoryId,
            });

            setItems(res.data);
            setMeta(res.meta);
        } catch (e: any) {
            console.error("[useFaqList]", e);
            setError(e.message ?? "FAQ 목록 조회 실패");
            setItems([]);
            setMeta(defaultMeta);
        } finally {
            setLoading(false);
        }
    }, [page, size, keyword, categoryId]);

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
            categoryId,
            loading,
            error,
        },
        actions: {
            setKeyword,
            setCategoryId: (id?: number) => {
                setPage(1);
                setCategoryId(id);
            },
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


