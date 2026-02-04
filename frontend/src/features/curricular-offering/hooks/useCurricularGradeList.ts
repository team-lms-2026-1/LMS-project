"use client";

import { useCallback, useEffect, useState } from "react";
import { CurricularOfferingCompetencyDto, CurricularOfferingDetailDto, CurricularOfferingGradeListItemDto, CurricularOfferingListItemDto, CurricularOfferingStudentListItemDto, PageMeta, StudentGradeDetailHeaderDto, StudentGradeDetailListDto } from "../api/types";
import { fetchCurricularDetailForm, fetchCurricularGradeDetailHeader, fetchCurricularGradeDetailList, fetchCurricularGradeList, fetchCurricularOfferingCompetency, fetchCurricularOfferingsList, fetchCurricularOfferingStudentList } from "../api/curricularOfferingsApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useCurricularGradeList() {
  const [items, setItems] = useState<CurricularOfferingGradeListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  const [deptId, setDeptId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchCurricularGradeList({
        page,
        size,
        deptId: deptId ?? undefined,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useCurricularGradeList]", e);
      setError(e.message ?? "교과성적 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, deptId, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,   // ✅ 항상 PageMeta
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

      // ✅ PaginationBar size 변경용
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      setDeptId: (id: number | null) => {
        setDeptId((prev) => {
          // 값이 같으면 아무 것도 하지 않음 (page 리셋도 방지)
          if (prev === id) return prev;

          // 값이 바뀌는 순간에만 page 1로 리셋
          setPage(1);
          return id;
        });
      },
      reload: load,
    },
  };
}


// 상세 헤더
export function useCurricularGradeDetailHeader(studentAccountId?: number, enabled: boolean = true) {
  const [data, setData] = useState<StudentGradeDetailHeaderDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularGradeDetailHeader(id);
      setData(res.data);
    } catch (e) {
      console.error("[useCurricularGradeDetailHeader]", e);
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

  return { state : { data, loading, error }, actions: { load, reload, setData }};
}

// 상세 리스트
type Props = {
    studentAccountId: number;
    enabled?: boolean
}

export function useCurricularGradeDetailList({ studentAccountId, enabled = true }: Props) {
  const [items, setItems] = useState<StudentGradeDetailListDto[]>([]);
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

      const res = await fetchCurricularGradeDetailList({
        page,
        size,
        semesterId: semesterId ?? undefined,
        keyword: keyword || undefined,
      }, studentAccountId);

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useCurricularGradeDetailList]", e);
      setError(e.message ?? "성적 상세 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [enabled, studentAccountId, page, size, semesterId, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta,   // ✅ 항상 PageMeta
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

      // ✅ PaginationBar size 변경용
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      setSemesterId: (id: number | null) => {
        setSemesterId((prev) => {
          // 값이 같으면 아무 것도 하지 않음 (page 리셋도 방지)
          if (prev === id) return prev;

          // 값이 바뀌는 순간에만 page 1로 리셋
          setPage(1);
          return id;
        });
      },
      reload: load,
    },
  };
}
