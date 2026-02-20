"use client";

import { useCallback, useEffect, useState } from "react";
import { ExtraOfferingApplicantRowDto, ExtraSessionDetailDto, ExtraSessionListItemDto, ExtraCurricularOfferingCompetencyDto, ExtraCurricularOfferingDetailDto, ExtraCurricularOfferingListItemDto, PageMeta } from "../api/types";
import { fetchExtraOfferingApplicantList, fetchExtraSessionDetail, fetchExtraSessionList, fetchExtraCurricularDetail, fetchExtraCurricularOfferingCompetency, fetchExtraCurricularOfferingList } from "../api/extraCurricularOfferingApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useExtraCurricularOfferingList() {
  const [items, setItems] = useState<ExtraCurricularOfferingListItemDto[]>([]);
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

      const res = await fetchExtraCurricularOfferingList({
        page,
        size,
        semesterId: semesterId ?? undefined,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useExtraCurricularOfferingList]", e);
      setError(e.message ?? "비교과 운영 목록 조회 실패");
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

// 상세 기본
export function useExtraCurricularDetail(offeringId?: number, enabled: boolean = true) {
  const [data, setData] = useState<ExtraCurricularOfferingDetailDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExtraCurricularDetail(id);
      setData(res.data);
    } catch (e) {
      console.error("[useExtraCurricularDetail]", e);
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
export function useExtraOfferingCompetencyMapping(offeringId?: number, enabled: boolean = true) {
  const [data, setData] = useState<ExtraCurricularOfferingCompetencyDto[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExtraCurricularOfferingCompetency(id);
      setData(res.data);
    } catch (e) {
      console.error("[useExtraOfferingCompetencyMapping]", e);
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


// session list
export function useExtraSessionList(offeringId?: number, enabled: boolean = true) {
  const [items, setItems] = useState<ExtraSessionListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // cleaned comment
    if (!enabled) return;
    if (!offeringId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetchExtraSessionList(offeringId, {
        page,
        size,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useExtraSessionList]", e);
      setError(e.message ?? "회차 조회 실패");
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

      // cleaned comment
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };
}

// applicant list
export function useExtraOfferingApplicantList(offeringId?: number, enabled: boolean = true) {
  const [items, setItems] = useState<ExtraOfferingApplicantRowDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    if (!offeringId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetchExtraOfferingApplicantList(offeringId, {
        page,
        size,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useExtraOfferingApplicantList]", e);
      setError(e?.message ?? "신청자 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [enabled, offeringId, page, size, keyword]);

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
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };
}

export function useExtraSessionDetail(
  offeringId?: number,
  sessionId?: number,
  enabled: boolean = true
) {
  const [data, setData] = useState<ExtraSessionDetailDto | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (oid: number, sid: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchExtraSessionDetail(oid, sid);
        setData(res.data);
      } catch (e: any) {
        console.error("[useExtraSessionDetail]", e);
        setError(e?.message ?? "세션 상세 조회 실패");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reload = useCallback(async () => {
    if (!enabled) return;
    if (!offeringId || !sessionId) return;
    await load(offeringId, sessionId);
  }, [enabled, offeringId, sessionId, load]);

  useEffect(() => {
    if (!enabled) return;
    if (!offeringId || !sessionId) return;
    void load(offeringId, sessionId);
  }, [enabled, offeringId, sessionId, load]);

  // cleaned comment
  useEffect(() => {
    setData(null);
    setError(null);
  }, [offeringId, sessionId]);

  return {
    state: { data, loading, error },
    actions: { load, reload, setData },
  };
}


