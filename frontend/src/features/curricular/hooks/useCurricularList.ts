"use client";

import { useCallback, useEffect, useState } from "react";
import { CurricularEditFormDto, CurricularListItemDto, PageMeta } from "../api/types";
import { fetchCurricularEditForm, fetchCurricularsList } from "../api/curricularsApi";


const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useCurricularsList() {
  const [items, setItems] = useState<CurricularListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  const [deptId, setDeptId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchCurricularsList({
        page,
        size,
        deptId: deptId ?? undefined,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useCurricularsList]", e);
      setError(e.message ?? "교과 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, deptId, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,   // cleaned comment
      page,
      size, 
      deptId,  // cleaned comment
      keyword,
      loading,
      error,
    },
    actions: {
      setKeyword,
      search: () => setPage(1),
      goPage: (p: number) => setPage(p),

      // cleaned comment
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },

      setDeptId: (id: number | null) => {
        setDeptId((prev) => {
          // cleaned comment
          if (prev === id) return prev;

          // cleaned comment
          setPage(1);
          return id;
        });
      },
      reload: load,
    },
  };
}

// cleaned comment
export function useCurricularEdit(curricularId?: number, enabled: boolean = true) {
  const [data, setData] = useState<CurricularEditFormDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularEditForm(id);
      setData(res.data);
    } catch (e) {
      console.error("[useCurricularEdit]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    if (!curricularId) return;
    void load(curricularId);
  }, [curricularId, enabled]);

  return { state : { data, loading, error }, actions: { load }};
}

