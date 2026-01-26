"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Options = {
  keywordKey?: string; // default "keyword"
  filterKey?: string;  // default "filter"
  pageKey?: string;    // default "page"
  sizeKey?: string;    // default "size"

  defaultKeyword?: string; // default ""
  defaultFilter?: string;  // default ""
};

function safeStr(v: string | null | undefined) {
  return (v ?? "").trim();
}

/**
 * URL 쿼리스트링 기반 검색 상태 관리
 * - keyword/filter 읽기
 * - setSearch로 반영(기본: page=1 리셋)
 * - 다른 쿼리 유지
 */
export function useSearchQuery(options?: Options) {
  const {
    keywordKey = "keyword",
    filterKey = "filter",
    pageKey = "page",
    sizeKey = "size",
    defaultKeyword = "",
    defaultFilter = "",
  } = options ?? {};

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const keyword = React.useMemo(() => {
    const v = safeStr(sp.get(keywordKey));
    return v.length ? v : defaultKeyword;
  }, [sp, keywordKey, defaultKeyword]);

  const filter = React.useMemo(() => {
    const v = safeStr(sp.get(filterKey));
    return v.length ? v : defaultFilter;
  }, [sp, filterKey, defaultFilter]);

  const setQuery = (next: Record<string, string | number | null | undefined>) => {
    const nextSp = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || String(v).trim() === "") nextSp.delete(k);
      else nextSp.set(k, String(v));
    });
    router.push(`${pathname}?${nextSp.toString()}`);
  };

  /**
   * 검색 반영:
   * - keyword/filter 갱신
   * - page는 1로 리셋(기본)
   */
  const setSearch = (nextKeyword: string, nextFilter: string, resetPage = true) => {
    setQuery({
      [keywordKey]: safeStr(nextKeyword),
      [filterKey]: safeStr(nextFilter),
      ...(resetPage ? { [pageKey]: 1 } : {}),
    });
  };

  /**
   * 선택적으로 size 변경 시 page=1 리셋
   */
  const setSize = (nextSize: number) => {
    const s = Math.max(1, Math.floor(nextSize));
    setQuery({ [sizeKey]: s, [pageKey]: 1 });
  };

  return { keyword, filter, setSearch, setSize };
}
