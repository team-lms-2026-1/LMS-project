"use client";

import { useState, useEffect } from "react";
import { fetchStudentMypage } from "../api/mypageApi";
import { StudentMypageResponse } from "../api/types";

// 상세 기본
export function useStudentMypage(enabled: boolean = true, initialData: StudentMypageResponse | null = null) {
    const [data, setData] = useState<StudentMypageResponse | null>(initialData);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchStudentMypage();
            if (res && res.data) {
                setData(res.data);
            } else {
                setError("데이터를 불러올 수 없습니다.");
            }
        } catch (e) {
            console.error("[useStudentMypage]", e);
            setError("조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (enabled) {
            load();
        }
    }, [enabled]);

    return { data, loading, error, load };
}
