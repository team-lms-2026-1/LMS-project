"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudentCompetencyListItemDto, PageMeta } from "@/features/competencies/scai/api/types";
import { fetchStudentCompetencyList } from "@/features/competencies/scai/api/StudentCompetencyApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useSClist() {
  const [items, setItems] = useState<StudentCompetencyListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [deptName, setDeptName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) {
        setLoading(true);
      }
      setError(null);

      const res = await fetchStudentCompetencyList({
        page,
        size,
        keyword: keyword || undefined,
        deptName: deptName || undefined,
      });

      setItems(res.data ?? []);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useSClist]", e);
      setError(e?.message ?? "Failed to load student competency activity list.");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      if (!opts?.silent) {
        setLoading(false);
      }
    }
  }, [page, size, keyword, deptName]);

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
      deptName,
      loading,
      error,
    },
    actions: {
      setKeyword,
      setDeptName: (next: string) => {
        setPage(1);
        setDeptName(next);
      },
      search: () => setPage(1),
      goPage: (p: number) => setPage(p),
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: (opts?: { silent?: boolean }) => load(opts),
    },
  };
}
