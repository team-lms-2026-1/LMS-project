"use client";

import { useCallback, useEffect, useState } from "react";
import { FaqListItemDto, PageMeta } from "../api/types";
import { fetchFaqsList } from "../api/FaqsApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useFaqsList() {
  const [items, setItems] = useState<FaqListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  // ✅ 추가: categoryId (null이면 전체)
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchFaqsList({
        page,
        size,
        keyword: keyword || undefined,
        categoryId: categoryId ?? undefined, // ✅ 추가
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useFaqsList]", e);
      setError(e.message ?? "FAQ 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, categoryId]); // ✅ categoryId 의존성 추가

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,
      page,
      size,
      keyword,
      categoryId, // ✅ 추가
      loading,
      error,
    },
    actions: {
      setKeyword,

      // ✅ 추가: 카테고리 변경 시 page 1로 리셋
      setCategoryId: (cid: number | null) => {
        setPage(1);
        setCategoryId(cid);
      },

      search: () => setPage(1),
      goPage: (p: number) => setPage(p),

      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },

      reload: load,
    },
  };
}
