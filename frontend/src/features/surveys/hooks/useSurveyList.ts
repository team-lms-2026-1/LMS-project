"use client";

import { useState, useEffect } from "react";
import { getSurveyList } from "../service";
import { SurveyListResponse } from "../types";

export function useSurveyList(keyword: string = "") {
    const [data, setData] = useState<SurveyListResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getSurveyList(page, 10, keyword);
            setData(res.items);
            setTotalPages(Math.ceil(res.totalItems / res.size));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, keyword]);

    return {
        data,
        loading,
        page,
        setPage,
        totalPages,
        refresh: fetchData,
    };
}
