"use client";

import { useCallback, useEffect, useState } from "react";
import type { PageMeta } from "../api/types";
import type { CurricularEnrollmentListItemDto } from "../api/types"; 

import { fetchCurricularEnrollmentsList } from "../api/curricularApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useCurricularEnrollmentsList() {
  const [items, setItems] = useState<CurricularEnrollmentListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchCurricularEnrollmentsList({ page, size });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta); // meta가 null일 가능성 있으면 방어
    } catch (e: any) {
      console.error("[useCurricularEnrollmentsList]", e);
      setError(e?.message ?? "수강신청 교과목 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: {
      items,
      meta,
      page,
      size,
      loading,
      error,
    },
    actions: {
      goPage: (p: number) => setPage(p),

      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },

      reload: load,
    },
  };
}
