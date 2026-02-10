"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  PageMeta,
  StudentExtraCompletionListItemDto,
  StudentExtraGradeDetailHeaderDto,
} from "../api/types";

import {
  fetchStudentExtraGradeMeHeader,
  fetchStudentExtraGradeMeList,
} from "../api/extraCuccicularApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useStudentExtraGradeMeHeader(enabled: boolean = true) {
  const [data, setData] = useState<StudentExtraGradeDetailHeaderDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentExtraGradeMeHeader();
      setData(res.data);
    } catch (e: any) {
      console.error("[useStudentExtraGradeMeHeader]", e);
      setError(e?.message ?? "비교과 성적 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { state: { data, loading, error }, actions: { reload: load } };
}

export function useStudentExtraGradeMeList() {
  const [items, setItems] = useState<StudentExtraCompletionListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [semesterId, setSemesterId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchStudentExtraGradeMeList({
        page,
        size,
        keyword: keyword || undefined,
        semesterId: semesterId ?? undefined,
      });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useStudentExtraGradeMeList]", e);
      setError(e?.message ?? "비교과 수료 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, semesterId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: { items, meta, page, size, keyword, semesterId, loading, error },
    actions: {
      goPage: (p: number) => setPage(p),
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      setKeyword: (v: string) => setKeyword(v),
      setSemesterId: (v: number | null) => setSemesterId(v),
      reload: load,
    },
  };
}
