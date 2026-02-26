"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ExtraCompletionListItemDto,
  ExtraCurricularGradeListItemDto,
  ExtraGradeDetailHeaderDto,
  PageMeta,
} from "../api/types";
import {
  fetchExtraCurricularGradeDetailHeader,
  fetchExtraCurricularGradeDetailList,
  fetchExtraCurricularGradeList,
} from "../api/extraCurricularOfferingApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useExtraCurricularGradeList() {
  const [items, setItems] = useState<ExtraCurricularGradeListItemDto[]>([]);
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

      const res = await fetchExtraCurricularGradeList({
        page,
        size,
        deptId: deptId ?? undefined,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useExtraCurricularGradeList]", e);
      setError(e?.message ?? "비교과 성적 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, deptId, keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: {
      items,
      meta,
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
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      setDeptId: (id: number | null) => {
        setDeptId((prev) => {
          if (prev === id) return prev;
          setPage(1);
          return id;
        });
      },
      reload: load,
    },
  };
}

export function useExtraCurricularGradeDetailHeader(
  studentAccountId?: number,
  enabled: boolean = true
) {
  const [data, setData] = useState<ExtraGradeDetailHeaderDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExtraCurricularGradeDetailHeader(id);
      setData(res.data);
    } catch (e) {
      console.error("[useExtraCurricularGradeDetailHeader]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    if (!studentAccountId) return;
    await load(studentAccountId);
  }, [studentAccountId, load]);

  useEffect(() => {
    if (!enabled) return;
    if (!studentAccountId) return;
    void load(studentAccountId);
  }, [studentAccountId, enabled, load]);

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}

type DetailProps = {
  studentAccountId: number;
  enabled?: boolean;
};

export function useExtraCurricularGradeDetailList({
  studentAccountId,
  enabled = true,
}: DetailProps) {
  const [items, setItems] = useState<ExtraCompletionListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [semesterId, setSemesterId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchExtraCurricularGradeDetailList(
        {
          page,
          size,
          semesterId: semesterId ?? undefined,
          keyword: keyword || undefined,
        },
        studentAccountId
      );

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useExtraCurricularGradeDetailList]", e);
      setError(e?.message ?? "비교과 성적 상세 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [enabled, studentAccountId, page, size, semesterId, keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: {
      items,
      meta,
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
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      setSemesterId: (id: number | null) => {
        setSemesterId((prev) => {
          if (prev === id) return prev;
          setPage(1);
          return id;
        });
      },
      reload: load,
    },
  };
}


