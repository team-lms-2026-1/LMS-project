"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ExtraCurricularOfferingCompetencyDto,
  ExtraCurricularOfferingDetailDto,
  ExtraCurricularEnrollmentListItemDto,
  ExtraCurricularOfferingUserListItemDto,
  ExtraSessionDetailDto,
  ExtraSessionListItemDto,
  PageMeta,
} from "../api/types";
import {
  fetchCurricularOfferingsList,
  fetchStudentExtraCurricularCompetency,
  fetchStudentExtraCurricularEnrollmentsList,
  fetchStudentExtraCurricularCurrentEnrollmentsList,
  fetchStudentExtraCurricularDetail,
  fetchStudentExtraSessionDetail,
  fetchStudentExtraSessionList,
} from "../api/extraCurricularApi";


const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useExtraCurricularOfferingList() {
  const [items, setItems] = useState<ExtraCurricularOfferingUserListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchCurricularOfferingsList({ page, size });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta); // meta가 null일 가능성 있으면 방어
    } catch (e: any) {
      console.error("[useCurricularCurrentEnrollmentsList]", e);
      setError(e?.message ?? "비교과운영 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: {
      items,
      meta,
      page,
      size,
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

// 상세 기본
export function useExtraCurricularDetail(offeringId?: number, enabled: boolean = true) {
  const [data, setData] = useState<ExtraCurricularOfferingDetailDto | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentExtraCurricularDetail(id);
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

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}

// session list (student)
export function useStudentExtraSessionList(offeringId?: number, enabled: boolean = true) {
  const [items, setItems] = useState<ExtraSessionListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    if (!offeringId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetchStudentExtraSessionList(offeringId, {
        page,
        size,
        keyword: keyword || undefined,
      });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useStudentExtraSessionList]", e);
      setError(e?.message ?? "회차 목록 조회 실패");
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
    state: { items, meta, page, size, keyword, loading, error },
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

// session detail (student)
export function useStudentExtraSessionDetail(
  offeringId?: number,
  sessionId?: number,
  enabled: boolean = true
) {
  const [data, setData] = useState<ExtraSessionDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (oid: number, sid: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentExtraSessionDetail(oid, sid);
      setData(res.data);
    } catch (e: any) {
      console.error("[useStudentExtraSessionDetail]", e);
      setError(e?.message ?? "회차 상세 조회 실패");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    setData(null);
    setError(null);
  }, [offeringId, sessionId]);

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}

// competency (student, read-only)
export function useStudentExtraOfferingCompetencyMapping(
  offeringId?: number,
  enabled: boolean = true
) {
  const [data, setData] = useState<ExtraCurricularOfferingCompetencyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentExtraCurricularCompetency(id);
      setData(res.data);
    } catch (e: any) {
      console.error("[useStudentExtraOfferingCompetencyMapping]", e);
      setError(e?.message ?? "역량 조회 실패");
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

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}

// enrollments list (student)
export function useStudentExtraCurricularEnrollmentsList() {
  const [items, setItems] = useState<ExtraCurricularEnrollmentListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchStudentExtraCurricularEnrollmentsList({ page, size });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useStudentExtraCurricularEnrollmentsList]", e);
      setError(e?.message ?? "비교과 신청현황 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: { items, meta, page, size, loading, error },
    actions: {
      goPage: (p: number) => setPage(p),
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };
}

// current enrollments list (student)
export function useStudentExtraCurricularCurrentEnrollmentsList() {
  const [items, setItems] = useState<ExtraCurricularEnrollmentListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchStudentExtraCurricularCurrentEnrollmentsList({ page, size });

      setItems(res.data);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useStudentExtraCurricularCurrentEnrollmentsList]", e);
      setError(e?.message ?? "이수중 비교과 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: { items, meta, page, size, loading, error },
    actions: {
      goPage: (p: number) => setPage(p),
      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },
      reload: load,
    },
  };
}
