"use client";

import { useCallback, useEffect, useState } from "react";
import type { PageMeta, QnaListItemDto } from "../api/types";
import { fetchQnaList } from "../api/qnaApi";
import { useI18n } from "@/i18n/useI18n";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useQnaList() {
  const t = useI18n("community.qna.professor.hook");

  const [items, setItems] = useState<QnaListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchQnaList({
        page,
        size,
        keyword: keyword || undefined,
        categoryId: categoryId ?? undefined,
      });

      setItems(res.data ?? []);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useQnaList]", e);
      setError(e?.message ?? t("listLoadFailed"));
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, categoryId, t]);

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
