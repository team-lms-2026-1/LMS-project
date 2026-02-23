"use client";

import { useCallback, useEffect, useState } from "react";
import { NoticeListItemDto, PageMeta } from "../api/types";
import { fetchNoticesList } from "../api/noticesApi";
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

export function useNoticesList() {
  const t = useI18n("community.notices.student.hook");

  const [items, setItems] = useState<NoticeListItemDto[]>([]);
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

      const res = await fetchNoticesList({
        page,
        size,
        keyword: keyword || undefined,
      });

      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useNoticesList]", e);
      setError(e.message ?? t("listLoadFailed"));
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, deptId, keyword, t]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,   // cleaned comment
      page,
      size,
      deptId,
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
        setPage(1);
        setDeptId(id);
      },

      reload: load,
    },
  };

}

