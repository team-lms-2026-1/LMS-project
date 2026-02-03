import { useEffect, useState, useCallback } from "react";
import { rentalsApi } from "../api/RentalsApi";
import type { RentalDto, RentalListParams, PageMeta } from "../api/types";

export function useRentalsList(initialParams: RentalListParams = { page: 1, size: 10 }) {
    const [data, setData] = useState<RentalDto[]>([]);
    const [meta, setMeta] = useState<PageMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [params, setParams] = useState<RentalListParams>(initialParams);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await rentalsApi.list(params);
            setData(res.data);
            setMeta(res.meta);
        } catch (e: any) {
            console.error(e);
            // 백엔드 미구현 시 Mock Data Fallback (개발 편의성)
            // setError(e?.message || "목록을 불러오지 못했습니다.");

            // ✅ Mock Data for UI Development
            setData([
                {
                    rentalId: 1,
                    space: { spaceId: 1, spaceName: "도서관 4층" },
                    room: { roomId: 1, roomName: "4인 스터디 룸" },
                    applicant: { accountId: 10, name: "홍길동", studentNo: "20230001", department: "컴퓨터공학과" },
                    rentalDate: "2026-01-09",
                    startTime: "09:00",
                    endTime: "11:00",
                    requestedAt: "2026-01-18",
                    status: "PENDING",
                },
                {
                    rentalId: 2,
                    space: { spaceId: 1, spaceName: "도서관 4층" },
                    room: { roomId: 1, roomName: "4인 스터디 룸" },
                    applicant: { accountId: 11, name: "나신학", studentNo: "20230002", department: "경영학과" },
                    rentalDate: "2026-01-09",
                    startTime: "11:00",
                    endTime: "12:00",
                    requestedAt: "2026-01-15",
                    status: "PENDING",
                },
            ]);
            setMeta({
                page: params.page || 1,
                size: params.size || 10,
                totalElements: 2,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
                sort: [],
            });
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const updateParams = (newParams: Partial<RentalListParams>) => {
        setParams((prev) => ({ ...prev, ...newParams }));
    };

    const approveRental = async (id: number) => {
        if (!confirm("승인하시겠습니까?")) return;
        try {
            await rentalsApi.approve(id);
            alert("승인되었습니다.");
            fetchList();
        } catch (e: any) {
            alert("처리 중 오류가 발생했습니다. (Mock Mode)");
            // Mock Action
            setData(prev => prev.filter(item => item.rentalId !== id));
        }
    };

    const rejectRental = async (id: number) => {
        if (!confirm("반려하시겠습니까?")) return;
        try {
            await rentalsApi.reject(id);
            alert("반려되었습니다.");
            fetchList();
        } catch (e: any) {
            alert("처리 중 오류가 발생했습니다. (Mock Mode)");
            // Mock Action
            setData(prev => prev.filter(item => item.rentalId !== id));
        }
    };

    return {
        data,
        meta,
        loading,
        error,
        params,
        updateParams,
        approveRental,
        rejectRental,
        refresh: fetchList,
    };
}
