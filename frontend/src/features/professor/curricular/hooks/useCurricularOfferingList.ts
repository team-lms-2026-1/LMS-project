"use client";

import { useCallback, useEffect, useState } from "react";

import {
  CurricularOfferingCompetencyDto,
  CurricularOfferingDetailDto,
  CurricularOfferingListItemDto,
  CurricularOfferingStudentListItemDto,
  PageMeta,
} from "../api/types";
import {
  fetchCurricularDetailForm,
  fetchCurricularOfferingCompetency,
  fetchCurricularOfferingsList,
  fetchCurricularOfferingStudentList,
} from "../api/curricularOfferingsApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
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
  const [size, setSize] = useState(10);
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
      setError(e.message ?? "내 강의 목록 조회에 실패했습니다.");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, semesterId, keyword]);

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

export function useCurricularDetail(offeringId?: number, enabled = true) {
  const [data, setData] = useState<CurricularOfferingDetailDto | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularDetailForm(id);
      setData(res.data);
    } catch (e) {
      console.error("[useCurricularDetail]", e);
      setError("상세 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    if (!offeringId) return;
    await load(offeringId);
  }, [offeringId, load]);

  useEffect(() => {
    if (!enabled || !offeringId) return;
    void load(offeringId);
  }, [enabled, offeringId, load]);

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}

export function useOfferingCompetencyMapping(offeringId?: number, enabled = true) {
  const [data, setData] = useState<CurricularOfferingCompetencyDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurricularOfferingCompetency(id);
      setData(res.data);
    } catch (e) {
      console.error("[useOfferingCompetencyMapping]", e);
      setError("역량 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    if (!offeringId) return;
    await load(offeringId);
  }, [offeringId, load]);

  useEffect(() => {
    if (!enabled || !offeringId) return;
    void load(offeringId);
  }, [enabled, offeringId, load]);

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}

export function useOfferingStudentsList(offeringId?: number, enabled = true) {
  const [items, setItems] = useState<CurricularOfferingStudentListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !offeringId) return;

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
      setError(e.message ?? "수강 학생 목록 조회에 실패했습니다.");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [enabled, offeringId, page, size, keyword]);

  useEffect(() => {
    void load();
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
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };
}


