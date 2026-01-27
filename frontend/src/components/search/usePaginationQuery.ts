
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UsePaginationQueryOptions = {
  pageKey?: string; // default "page"
  sizeKey?: string; // default "size"
  defaultPage?: number; // default 1
  defaultSize?: number; // default 10

  /** history 기록 방식 (페이지네이션은 보통 replace가 UX 좋음) */
  history?: "push" | "replace"; // default "replace"

  /** 페이지 이동 시 스크롤 이동 여부 (목록은 보통 false 추천) */
  scroll?: boolean; // default false
};

/**
 * URL 쿼리스트링 기반 페이지네이션 상태 관리
 * - page/size를 읽고, setPage/setSize로 URL 갱신
 * - keyword 등 다른 쿼리는 유지
 */
export function usePaginationQuery(options?: UsePaginationQueryOptions) {
  const {
    pageKey = "page",
    sizeKey = "size",
    defaultPage = 1,
    defaultSize = 10,
    history = "replace",
    scroll = false,
  } = options ?? {};

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const page = React.useMemo(() => {
    const raw = sp.get(pageKey);
    const v = raw ? Number(raw) : NaN;
    return Number.isFinite(v) && v >= 1 ? v : defaultPage;
  }, [sp, pageKey, defaultPage]);

  const size = React.useMemo(() => {
    const raw = sp.get(sizeKey);
    const v = raw ? Number(raw) : NaN;
    return Number.isFinite(v) && v >= 1 ? v : defaultSize;
  }, [sp, sizeKey, defaultSize]);

  const navigate = (url: string) => {
    if (history === "push") router.push(url, { scroll });
    else router.replace(url, { scroll });
  };

  const setQuery = (next: Record<string, string | number | null | undefined>) => {
    const nextSp = new URLSearchParams(sp.toString());

    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || String(v).trim() === "") nextSp.delete(k);
      else nextSp.set(k, String(v));
    });

    const qs = nextSp.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname); // '?' 꼬리 방지
  };

  const setPage = (nextPage: number) => {
    setQuery({ [pageKey]: Math.max(1, Math.floor(nextPage)) });
  };

  const setSize = (nextSize: number) => {
    const s = Math.max(1, Math.floor(nextSize));
    // size가 바뀌면 보통 page는 1로 리셋
    setQuery({ [sizeKey]: s, [pageKey]: 1 });
  };

  return { page, size, setPage, setSize };
}
