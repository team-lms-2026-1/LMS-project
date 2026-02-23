"use client";

import { useCallback, useEffect, useState } from "react";
import { FaqListItemDto, PageMeta } from "../api/types";
import { fetchFaqsList } from "../api/faqsApi";
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

export function useFaqsList() {
  const t = useI18n("community.faqs.student.hook");

  const [items, setItems] = useState<FaqListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
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
      setError(e.message ?? t("listLoadFailed"));
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, t]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,   // cleaned comment
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

      // cleaned comment
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };

}

