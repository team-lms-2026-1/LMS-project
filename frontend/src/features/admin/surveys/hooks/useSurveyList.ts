"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchSurveysList } from "../api/surveysApi";
import { SurveyListItemDto } from "../api/types";
import { PageMeta } from "../../curricular/api/types";
import { useI18n } from "@/i18n/useI18n";

const defaultMeta: PageMeta = {
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    sort: [],
};

export function useSurveyList() {
    const t = useI18n("survey.hooks.list");
    const [items, setItems] = useState<SurveyListItemDto[]>([]);
    const [meta, setMeta] = useState<PageMeta>(defaultMeta);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);

            const res = await fetchSurveysList(page, size, keyword, type);
            setItems(res.data);
            if (res.meta) {
                setMeta(res.meta);
            }
            setError(null);
        } catch (e: any) {
            console.error("[useSurveyList]", e);
            toast.error(e.message ?? t("loadFailed"));
            setError(e.message || t("loadFailed"));
            setItems([]);
            setMeta(defaultMeta);
        } finally {
            setLoading(false);
        }
    }, [page, size, keyword, type]);

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
            type,
            loading,
            error,
        },
        actions: {
            setKeyword,
            setType,
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
