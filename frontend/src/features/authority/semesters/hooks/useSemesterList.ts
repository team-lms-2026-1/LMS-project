"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSemestersList } from "../api/semestersApi";
import type {
  SemesterItem,
  SemesterListItemDto,
  PageMeta,
} from "../api/types";

function mapDto(dto: SemesterListItemDto): SemesterItem {
  return {
    id: String(dto.semesterId),
    year: dto.year,
    term: dto.term,
    startDate: dto.startDate,
    endDate: dto.endDate,
    period: `${dto.startDate} ~ ${dto.endDate}`,
    status: dto.status,
  };
}

export function useSemestersList() {
  const [items, setItems] = useState<SemesterItem[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);

  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchSemestersList({
        page,
        size,
        keyword: keyword || undefined,
      });

      setItems(res.data.map(mapDto));
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useSemestersList]", e);
      setError(e.message ?? "학기 목록 조회 실패");
      setItems([]);
      setMeta(null);
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
      meta,
      page,
      keyword,
      loading,
      error,
    },
    actions: {
      setKeyword,
      search: () => setPage(1),
      goPage: (p: number) => setPage(p),
      reload: load,
    },
  };
}
