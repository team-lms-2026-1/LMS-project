import { useState, useEffect, useCallback } from "react";
import { fetchRecruitments } from "../api/mentoringApi";
import { MentoringRecruitment, PageMeta } from "../api/types";

export const useMentoringRecruitmentList = (pageSize: number = 10) => {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<MentoringRecruitment[]>([]);
    const [meta, setMeta] = useState<PageMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");

    const [status, setStatus] = useState("ALL");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchRecruitments({
                page: page - 1,
                size: pageSize,
                keyword: searchKeyword,
                status: status !== "ALL" ? status : undefined
            });
            setItems(res.data || []);
            setMeta(res.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchKeyword, status]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
        setPage(1); // 검색 시 첫 페이지로 이동
    };

    return {
        items,
        meta,
        loading,
        page,
        setPage,
        searchKeyword,
        setSearchKeyword,
        status,
        setStatus,
        handleSearch,
        refresh: fetchData
    };
};
