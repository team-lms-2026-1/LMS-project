"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExtraCurricularOfferingDetailDto, ExtraCurricularOfferingUserListItemDto, PageMeta } from "../api/types";
import { fetchCurricularOfferingsList, fetchStudentExtraCurricularDetail } from "../api/extraCuccicularApi";


const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useExtraCurricularOfferingList() {
  const [items, setItems] = useState<ExtraCurricularOfferingUserListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchCurricularOfferingsList({ page, size });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta); // meta가 null일 가능성 있으면 방어
    } catch (e: any) {
      console.error("[useCurricularCurrentEnrollmentsList]", e);
      setError(e?.message ?? "비교과운영 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);

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
      setKeyword,
      search: () => setPage(1),
      goPage: (p: number) => setPage(p),

      // ✅ PaginationBar size 변경용
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };
}

// 상세 기본
export function useExtraCurricularDetail(offeringId?: number, enabled: boolean = true) {
  const [data, setData] = useState<ExtraCurricularOfferingDetailDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentExtraCurricularDetail(id);
      setData(res.data);
    } catch (e) {
      console.error("[useExtraCurricularDetail]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };
  
  const reload = useCallback(async () => {
    if (!offeringId) return;
    await load(offeringId);
  }, [offeringId, load]);

  useEffect(() => {
    if (!enabled) return;
    if (!offeringId) return;
    void load(offeringId);
  }, [offeringId, enabled]);

  return { state : { data, loading, error }, actions: { load, reload, setData }};
}