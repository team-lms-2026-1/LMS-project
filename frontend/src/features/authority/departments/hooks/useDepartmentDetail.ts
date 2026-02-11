"use client";

import { useCallback, useEffect, useState } from "react";
import { DepartmentDetailSummary, MajorListItem, DepartmentProfessorListItem, DepartmentStudentListItem, PageMeta } from "../api/types";
import { fetchDepartmentSummary, fetchDepartmentMajors, fetchDepartmentProfessors, fetchDepartmentStudents } from "../api/departmentsApi";

export function useDepartmentDetail(deptId: number) {
    const [summary, setSummary] = useState<DepartmentDetailSummary | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [errorSummary, setErrorSummary] = useState<string | null>(null);

    const loadSummary = useCallback(async () => {
        try {
            setLoadingSummary(true);
            setErrorSummary(null);
            const res = await fetchDepartmentSummary(deptId);
            // fetchDepartmentSummary 리턴 타입: Promise<{data: DepartmentDetailSummary}>
            setSummary(res.data);
        } catch (err: any) {
            console.error(err);
            setErrorSummary(err.message || "학과 상세 조회 실패");
        } finally {
            setLoadingSummary(false);
        }
    }, [deptId]);

    useEffect(() => {
        if (deptId) loadSummary();
    }, [loadSummary]);

    return {
        summary,
        loadingSummary,
        errorSummary,
        reloadSummary: loadSummary,
    };
}

// 전공 목록 Hook
export function useDepartmentMajors(deptId: number) {
    const [majors, setMajors] = useState<MajorListItem[]>([]);
    const [meta, setMeta] = useState<PageMeta>({
        page: 1, size: 20, totalElements: 0, totalPages: 1, hasNext: false, hasPrev: false
    });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(20);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchDepartmentMajors(deptId, page, size, keyword);
            // res.data -> MajorListItem[], res.meta -> PageMeta (MajorListResponse 구조)
            setMajors(res.data);
            setMeta(res.meta);
        } catch (e) {
            console.error(e);
            setMajors([]);
        } finally {
            setLoading(false);
        }
    }, [deptId, page, size, keyword]);

    useEffect(() => {
        if (deptId) load();
    }, [load]);

    return {
        majors, meta, page, size, keyword, setPage, setSize, setKeyword, loading, reload: load
    };
}

// 교수 목록 Hook
export function useDepartmentProfessors(deptId: number) {
    const [items, setItems] = useState<DepartmentProfessorListItem[]>([]);
    const [meta, setMeta] = useState<PageMeta>({
        page: 1, size: 20, totalElements: 0, totalPages: 1, hasNext: false, hasPrev: false
    });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(20);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchDepartmentProfessors(deptId, page, size, keyword);
            setItems(res.data);
            setMeta(res.meta);
        } catch (e) {
            console.error(e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [deptId, page, size, keyword]);

    useEffect(() => {
        if (deptId) load();
    }, [load]);

    return {
        items, meta, page, size, keyword, setPage, setSize, setKeyword, loading, reload: load
    };
}

// 학생 목록 Hook
export function useDepartmentStudents(deptId: number) {
    const [items, setItems] = useState<DepartmentStudentListItem[]>([]);
    const [meta, setMeta] = useState<PageMeta>({
        page: 1, size: 20, totalElements: 0, totalPages: 1, hasNext: false, hasPrev: false
    });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(20);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchDepartmentStudents(deptId, page, size, keyword);
            setItems(res.data);
            setMeta(res.meta);
        } catch (e) {
            console.error(e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [deptId, page, size, keyword]);

    useEffect(() => {
        if (deptId) load();
    }, [load]);

    return {
        items, meta, page, size, keyword, setPage, setSize, setKeyword, loading, reload: load
    };
}
