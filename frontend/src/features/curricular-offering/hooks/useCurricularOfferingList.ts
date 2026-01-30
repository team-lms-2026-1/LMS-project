"use client";

import { useCallback, useEffect, useState } from "react";
import { CurricularOfferingCompetencyDto, CurricularOfferingDetailDto, CurricularOfferingListItemDto, CurricularOfferingStudentListItemDto, PageMeta } from "../api/types";
import { fetchCurricularDetailForm, fetchCurricularOfferingCompetency, fetchCurricularOfferingsList, fetchCurricularOfferingStudentList } from "../api/curricularOfferingsApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useCurricularOfferingsList() {
  const [items, setItems] = useState<CurricularOfferingListItemDto[]>([]);
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

      const res = await fetchCurricularOfferingsList({
        page,
        size,
        semesterId: semesterId ?? undefined,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useCurricularOfferingsList]", e);
      setError(e.message ?? "교과운영 목록 조회 실패");
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


// 모달 수정조회
export function useCurricularDetail(offeringId?: number, enabled: boolean = true) {
  const [data, setData] = useState<CurricularOfferingDetailDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularDetailForm(id);
      setData(res.data);
    } catch (e) {
      console.error("[useCurricularDetail]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };
  
  const reload = useCallback(async () => {
    if (!offeringId) return;
    await load(offeringId);
  }, [offeringId, load]);

  useEffect(() => {
    if (!enabled) return;
    if (!offeringId) return;
    void load(offeringId);
  }, [offeringId, enabled]);

  return { state : { data, loading, error }, actions: { load, reload, setData }};
}

// competency
export function useOfferingCompetencyMapping(offeringId?: number, enabled: boolean = true) {
  const [data, setData] = useState<CurricularOfferingCompetencyDto[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularOfferingCompetency(id);
      setData(res.data);
    } catch (e) {
      console.error("[useOfferingCompetencyMapping]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };
  
  const reload = useCallback(async () => {
    if (!offeringId) return;
    await load(offeringId);
  }, [offeringId, load]);

  useEffect(() => {
    if (!enabled) return;
    if (!offeringId) return;
    void load(offeringId);
  }, [offeringId, enabled]);

  return { state : { data, loading, error }, actions: { load, reload, setData }};
}

// student
export function useOfferingStudentsList(offeringId?: number, enabled: boolean = true) {
  const [items, setItems] = useState<CurricularOfferingStudentListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // offering id 없으면 호출 안함 추가
    if (!enabled) return;
    if (!offeringId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetchCurricularOfferingStudentList(offeringId, {
        page,
        size,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useOfferingStudentsList]", e);
      setError(e.message ?? "수강생 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [offeringId, page, size, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [offeringId]);

  return {
    state: {
      items,
      meta,
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

      // ✅ PaginationBar size 변경용
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };
}
