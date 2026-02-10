"use client";

import { useCallback, useEffect, useState } from "react";
import { FaqListItemDto, PageMeta } from "../api/types";
import { fetchFaqsList } from "../api/faqsApi";


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