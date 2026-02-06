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
      setData(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (e: any) {
      console.error(e);

      // ✅ Mock 제거: 실패하면 그냥 빈 리스트 + 에러 표시
      setData([]);
      setMeta(null);

      const msg =
        e?.status
          ? `목록을 불러오지 못했습니다. (HTTP ${e.status})`
          : "목록을 불러오지 못했습니다.";
      setError(msg);
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
      console.error(e);
      alert(e?.status ? `처리 중 오류가 발생했습니다. (HTTP ${e.status})` : "처리 중 오류가 발생했습니다.");
    }
  };

  const rejectRental = async (id: number, reason: string) => {
    try {
        await rentalsApi.reject(id, reason);
        alert("반려되었습니다.");
        fetchList();
    } catch (e: any) {
        console.error(e);
        alert("처리 중 오류가 발생했습니다.");
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
