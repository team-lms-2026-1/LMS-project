"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCurricularGradeMeHeader, fetchCurricularGradeMeList } from "../api/curricularApi";
import { StudentGradeDetailHeaderDto, StudentGradeDetailListDto } from "@/features/curricular-offering/api/types";
import { PageMeta } from "../api/types";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

// 상세 헤더
export function useCurricularGradeMeHeader(enabled = true) {
  const [data, setData] = useState<StudentGradeDetailHeaderDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularGradeMeHeader();
      setData(res.data);
    } catch (e) {
      console.error("[useCurricularGradeMeHeader]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { state : { data, loading, error }, actions: { load, setData }};
}

// cleaned comment
export function useCurricularGradeMeList() {
  const [items, setItems] = useState<StudentGradeDetailListDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  const [semesterId, setSemesterId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchCurricularGradeMeList({
        page,
        size,
        semesterId: semesterId ?? undefined,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useCurricularGradeMeList]", e);
      setError(e.message ?? "성적 상세 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, semesterId, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,   // cleaned comment
      page,
      size,
      semesterId,
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
      setSemesterId: (id: number | null) => {
        setSemesterId((prev) => {
          // cleaned comment
          if (prev === id) return prev;

          // cleaned comment
          setPage(1);
          return id;
        });
      },
      reload: load,
    },
  };
}


