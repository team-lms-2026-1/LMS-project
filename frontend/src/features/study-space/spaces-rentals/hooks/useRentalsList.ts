import { useEffect, useState, useCallback } from "react";
import { rentalsApi } from "../api/rentalsApi";
import type { RentalDto, RentalListParams, PageMeta } from "../api/types";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export function useRentalsList(initialParams: RentalListParams = { page: 1, size: 10 }) {
  const t = useI18n("studySpace.admin.rentals.hook");
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

      setData([]);
      setMeta(null);

      const msg = e?.status ? t("errors.listWithStatus", { status: e.status }) : t("errors.list");
      setError(msg);
    } finally {
      if (!opts?.silent) {
        setLoading(false);
      }
    }
  }, [params, t]);

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
      toast.success(t("toasts.approved"));
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.status ? t("errors.processWithStatus", { status: e.status }) : t("errors.process"));
    }
  };

  const rejectRental = async (id: number, reason: string) => {
    try {
      await rentalsApi.reject(id, reason);
      toast.success(t("toasts.rejected"));
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(t("errors.process"));
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
