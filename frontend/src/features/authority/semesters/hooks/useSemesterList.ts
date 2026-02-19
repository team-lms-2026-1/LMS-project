"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSemesterDetail, fetchSemestersList } from "../api/semestersApi";
import type { SemesterItem, SemesterListItemDto, PageMeta, SemesterDetailDto } from "../api/types";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

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
      setMeta(defaultMeta); // cleaned comment
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
      meta,   // cleaned comment
      page,
      size,   // cleaned comment
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


// cleaned comment
export function useSemesterDetail(semesterId?: string, enabled: boolean = true) {
  const [data, setData] = useState<SemesterDetailDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSemesterDetail(id);
      setData(res.data);
    } catch (e) {
      console.error("[useSemesterDetail]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    if (!semesterId) return;
    void load(semesterId);
  }, [semesterId, enabled]);

  return { state : { data, loading, error }, actions: { load }};
}

