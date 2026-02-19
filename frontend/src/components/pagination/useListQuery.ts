"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UseListQueryOptions = {
  pageKey?: string; // default "page"
  sizeKey?: string; // default "size"
  keywordKey?: string; // ✅ default "keyword"

  defaultPage?: number; // default 1
  defaultSize?: number; // default 10
  defaultKeyword?: string; // ✅ default ""

  history?: "push" | "replace"; // default "replace"
  scroll?: boolean; // default false
};

export function useListQuery(options?: UseListQueryOptions) {
  const {
    pageKey = "page",
    sizeKey = "size",
    keywordKey = "keyword",

    defaultPage = 1,
    defaultSize = 10,
    defaultKeyword = "",

    history = "replace",
    scroll = false,
  } = options ?? {};

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const page = React.useMemo(() => {
    const raw = sp.get(pageKey);
    const v = raw ? Number(raw) : NaN;
    return Number.isFinite(v) && v >= 1 ? Math.floor(v) : defaultPage;
  }, [sp, pageKey, defaultPage]);

  const size = React.useMemo(() => {
    const raw = sp.get(sizeKey);
    const v = raw ? Number(raw) : NaN;
    return Number.isFinite(v) && v >= 1 ? Math.floor(v) : defaultSize;
  }, [sp, sizeKey, defaultSize]);

  // ✅ keyword
  const keyword = React.useMemo(() => {
    const raw = sp.get(keywordKey);
    return raw ?? defaultKeyword;
  }, [sp, keywordKey, defaultKeyword]);

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
    navigate(qs ? `${pathname}?${qs}` : pathname);
  };

  const setPage = (nextPage: number) => {
    setQuery({ [pageKey]: Math.max(1, Math.floor(nextPage)) });
  };

  const setSize = (nextSize: number) => {
    const s = Math.max(1, Math.floor(nextSize));
    setQuery({ [sizeKey]: s, [pageKey]: 1 });
  };

  // ✅ keyword 변경 시 1페이지로 리셋 (보통 이게 UX 표준)
  const setKeyword = (nextKeyword: string) => {
    setQuery({ [keywordKey]: nextKeyword, [pageKey]: 1 });
  };

  return { page, size, keyword, setPage, setSize, setKeyword, setQuery };
}
