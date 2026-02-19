import { useCallback, useEffect, useState } from "react";
import { fetchDepartmentsList } from "../api/departmentsApi";
import { DepartmentListItem, PageMeta } from "../api/types";
import { useListQuery } from "@/components/pagination";
import toast from "react-hot-toast";

export function useDepartmentList() {
    const { page, size, keyword: queryKeyword, setPage, setKeyword: setQueryKeyword } = useListQuery({
        defaultSize: 10,
        keywordKey: "keyword", // URL query param name
    });

    const [items, setItems] = useState<DepartmentListItem[]>([]);
    const [meta, setMeta] = useState<PageMeta>({
        totalElements: 0,
        totalPages: 1,
        page: 1,
        size: 10,
        hasNext: false,
        hasPrev: false,
    });
    const [loading, setLoading] = useState(false);

    // cleaned comment
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const reload = useCallback(() => setReloadTrigger((prev) => prev + 1), []);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchDepartmentsList(page, size, queryKeyword || undefined);
            setItems(res.data);
            // cleaned comment
            setMeta({
                ...res.meta,
                totalPages: res.meta.totalPages || 1
            });
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "목록 로드 실패");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [page, size, queryKeyword]);

    useEffect(() => {
        load();
    }, [load, reloadTrigger]);

    return {
        items,
        meta,
        loading,
        page,
        size,
        keyword: queryKeyword,
        setPage, // URL query 업데이트 -> useEffect load() 재실행
        setKeyword: setQueryKeyword, // URL query 업데이트 -> useEffect load() 재실행
        reload,
    };
}


