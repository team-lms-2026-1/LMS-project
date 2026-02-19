import { useEffect, useState, useCallback } from "react";
import { rentalsApi } from "../api/rentalsApi";
import type { RentalDto, RentalListParams, PageMeta } from "../api/types";
import toast from "react-hot-toast";

export function useRentalsList(initialParams: RentalListParams = { page: 1, size: 10 }) {
  const [data, setData] = useState<RentalDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [params, setParams] = useState<RentalListParams>(initialParams);

  const fetchList = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
    }
    setError("");

    try {
      const res = await rentalsApi.list(params);
      setData(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (e: any) {
      console.error(e);

      // cleaned comment
      setData([]);
      setMeta(null);

      const msg =
        e?.status
          ? `목록을 불러오지 못했습니다. (HTTP ${e.status})`
          : "목록을 불러오지 못했습니다.";
      setError(msg);
    } finally {
      if (!opts?.silent) {
        setLoading(false);
      }
    }
  }, [params]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const onFocus = () => fetchList({ silent: true });
    window.addEventListener("focus", onFocus);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchList({ silent: true });
      }
    }, 10000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalId);
    };
  }, [fetchList]);

  const updateParams = (newParams: Partial<RentalListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const approveRental = async (id: number) => {
    try {
      await rentalsApi.approve(id);
      toast.success("승인되었습니다.");
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.status ? `처리 중 오류가 발생했습니다. (HTTP ${e.status})` : "처리 중 오류가 발생했습니다.");
    }
  };

  const rejectRental = async (id: number, reason: string) => {
    try {
      await rentalsApi.reject(id, reason);
      toast.success("반려되었습니다.");
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error("처리 중 오류가 발생했습니다.");
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
