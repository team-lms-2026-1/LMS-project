"use client";

import { useCallback, useEffect, useState } from "react";
import { ExtraCurricularEditFormDto, ExtraCurricularListItemDto, PageMeta } from "../api/types";
import { fetchCurricularExtraEditForm, fetchExtraCurricularMasterList } from "../api/extraCurricularMasterApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useExtraCurricularMasterList() {
  const [items, setItems] = useState<ExtraCurricularListItemDto[]>([]);
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

      const res = await fetchExtraCurricularMasterList({
        page,
        size,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useExtraCurricularMasterList]", e);
      setError(e.message ?? "비교과 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,   // ✅ 항상 PageMeta
      page,
      size,
      keyword,
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


// 모달 수정조회
export function useExtraCurricularEdit(extraCurricularId?: number, enabled: boolean = true) {
  const [data, setData] = useState<ExtraCurricularEditFormDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularExtraEditForm(id);
      setData(res.data);
    } catch (e) {
      console.error("[useExtraCurricularEdit]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    if (!extraCurricularId) return;
    void load(extraCurricularId);
  }, [extraCurricularId, enabled]);

  return { state : { data, loading, error }, actions: { load }};
}