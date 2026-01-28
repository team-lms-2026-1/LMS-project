// src/features/dropdowns/_shared/useFilterQuery.ts
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterValue = string | number | null | undefined;

export function useFilterQuery(
  filterKeys: string[],
  options?: { history?: "push" | "replace"; scroll?: boolean }
) {
  const { history = "replace", scroll = false } = options ?? {};
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const filters = React.useMemo(() => {
    const obj: Record<string, string> = {};
    filterKeys.forEach((k) => {
      const v = sp.get(k);
      if (v !== null) obj[k] = v;
    });
    return obj;
  }, [sp, filterKeys]);

  const navigate = (nextSp: URLSearchParams) => {
    const qs = nextSp.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (history === "push") router.push(url, { scroll });
    else router.replace(url, { scroll });
  };

  const setFilters = (next: Record<string, FilterValue>) => {
    const nextSp = new URLSearchParams(sp.toString());

    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || String(v).trim() === "") nextSp.delete(k);
      else nextSp.set(k, String(v));
    });

    // ✅ 필터 바뀌면 페이지 1로 리셋하는 게 UX 표준
    nextSp.set("page", "1");

    navigate(nextSp);
  };

  const get = (key: string) => filters[key] ?? "";

  return { filters, get, setFilters };
}
