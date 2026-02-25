"use client";

import { useCallback, useEffect, useState } from "react";
import { rentalsApi } from "../api/rentalsApi";
import type { RentalDto, RentalListParams, PageMeta } from "../api/types";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export function useRentalsList(
  initialParams: RentalListParams = { page: 1, size: 10 }
) {
  const t = useI18n("studySpace.admin.rentals.hook");

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
      setData(Array.isArray(res?.data) ? res.data : []);
      setMeta(res?.meta ?? null);
    } catch (e: any) {
      console.error(e);
      setData([]);
      setMeta(null);
      setError(e?.status ? t("errors.listWithStatus", { status: e.status }) : t("errors.list"));
    } finally {
      setLoading(false);
    }
  }, [params, t]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const updateParams = useCallback((newParams: Partial<RentalListParams>) => {
    setParams((prev) => {
      const next = { ...prev, ...newParams };
      if (next.page === prev.page && next.size === prev.size && next.keyword === prev.keyword) {
        return prev;
      }
      return next;
    });
  }, []);

  const approveRental = async (rentalId: number) => {
    try {
      await rentalsApi.approve(rentalId);
      toast.success(t("toasts.approved"));
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.status ? t("errors.processWithStatus", { status: e.status }) : t("errors.process"));
    }
  };

  const rejectRental = async (rentalId: number, reason: string) => {
    try {
      await rentalsApi.reject(rentalId, reason);
      toast.success(t("toasts.rejected"));
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.status ? t("errors.processWithStatus", { status: e.status }) : t("errors.process"));
    }
  };

  return {
    data,
    meta,
    loading,
    error,
    params,
    updateParams,
    refresh: fetchList,
    approveRental,
    rejectRental,
  };
}
