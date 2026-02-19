"use client";

import { useCallback, useEffect, useState } from "react";
import type { NoticeListItemDto, PageMeta } from "../api/types";
import { fetchNoticesList } from "../api/noticesApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useNoticesList() {
  const [items, setItems] = useState<NoticeListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  // cleaned comment
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchNoticesList({
        page,
        size,
        keyword: keyword || undefined,
        categoryId: categoryId ?? undefined, // cleaned comment
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useNoticesList]", e);
      setError(e.message ?? "공지사항 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, categoryId]);

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
      categoryId,
      loading,
      error,
    },
    actions: {
      setKeyword,

      // cleaned comment
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


