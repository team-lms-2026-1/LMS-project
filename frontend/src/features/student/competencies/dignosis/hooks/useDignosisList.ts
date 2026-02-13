"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiagnosisListItemDto, PageMeta } from "../api/types";
import { fetchDiagnosisList } from "../api/DignosisApi";

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

function getStatusValue(item: DiagnosisListItemDto) {
  const raw = (item as any) ?? {};
  return String(
    raw.status ??
      raw.runStatus ??
      raw.diagnosisStatus ??
      raw?.basicInfo?.status ??
      ""
  );
}

function isHiddenStatus(status?: string) {
  const value = String(status ?? "").trim().toUpperCase();
  return value === "DRAFT" || value === "CLOSED";
}

function getCreatedAtMs(item: DiagnosisListItemDto) {
  const raw =
    (item as any)?.createdAt ??
    (item as any)?.created_at ??
    (item as any)?.createdDate ??
    (item as any)?.createdDatetime ??
    (item as any)?.registeredAt ??
    (item as any)?.regAt ??
    (item as any)?.regDate;
  if (!raw) return Number.NEGATIVE_INFINITY;
  const ts = Date.parse(String(raw));
  return Number.isFinite(ts) ? ts : Number.NEGATIVE_INFINITY;
}

export function useDignosisList() {
  const [items, setItems] = useState<DiagnosisListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      setError(null);
      const res = await fetchDiagnosisList();
      const nextItems = (res.data ?? [])
        .filter((item) => !isHiddenStatus(getStatusValue(item)))
        .slice()
        .sort((a, b) => {
          const aCreated = getCreatedAtMs(a);
          const bCreated = getCreatedAtMs(b);
          if (aCreated !== bCreated) return bCreated - aCreated;
          const aId = Number(a.diagnosisId);
          const bId = Number(b.diagnosisId);
          const aSort = Number.isFinite(aId) ? aId : Number.NEGATIVE_INFINITY;
          const bSort = Number.isFinite(bId) ? bId : Number.NEGATIVE_INFINITY;
          return bSort - aSort;
        });
      setItems(nextItems);
    } catch (e: any) {
      console.error("[useDignosisList]", e);
      setError(e?.message ?? "진단서 목록 조회 실패");
      setItems([]);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => load({ silent: true });
    window.addEventListener("focus", onFocus);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load({ silent: true });
      }
    }, 10000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalId);
    };
  }, [load]);

  const filteredItems = useMemo(() => {
    const normalized = normalizeKeyword(keyword);
    if (!normalized) return items;
    return items.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const semester = item.semesterName?.toLowerCase() ?? "";
      return title.includes(normalized) || semester.includes(normalized);
    });
  }, [items, keyword]);

  const totalElements = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedItems = useMemo(() => {
    const startIndex = (page - 1) * size;
    return filteredItems.slice(startIndex, startIndex + size);
  }, [filteredItems, page, size]);

  const meta: PageMeta = useMemo(
    () => ({
      page,
      size,
      totalElements,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      sort: [],
    }),
    [page, size, totalElements, totalPages]
  );

  return {
    state: {
      items: pagedItems,
      meta,
      page,
      size,
      keyword,
      loading,
      error,
    },
    actions: {
      setKeyword: (next: string) => {
        setPage(1);
        setKeyword(next);
      },
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
