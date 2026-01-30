"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, CategoryListResponse, CategoryListQuery, CategoryScope, PageMeta } from "../api/types";
import { categoriesApi } from "../api/CategoriesApi";

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

/** 응답이 배열/페이지 형태 둘 다 가능하므로 공용으로 풀어주는 함수 */
function unwrapCategoryList(res: CategoryListResponse): { items: Category[]; meta: PageMeta } {
  const data: any = (res as any)?.data;

  // case 1) ApiResponse<Page<Category>>
  if (data && typeof data === "object" && Array.isArray(data.items)) {
    const meta = (data.meta ?? defaultMeta) as PageMeta;
    return { items: data.items as Category[], meta };
  }

  // case 2) ApiResponse<Category[]>
  if (Array.isArray(data)) {
    // 배열 응답이면 meta가 없을 수 있으니 "현재 페이지 상태"는 훅에서 덮어씀
    return { items: data as Category[], meta: defaultMeta };
  }

  return { items: [], meta: defaultMeta };
}

export function useCategoryList(scope: CategoryScope) {
  const [items, setItems] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query: CategoryListQuery = useMemo(
    () => ({
      page,
      size,
      keyword: keyword.trim() ? keyword.trim() : undefined,
    }),
    [page, size, keyword]
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await categoriesApi.list(scope, query);
      const { items: list, meta: m } = unwrapCategoryList(res);

      setItems(list);

      // 배열 응답이면 defaultMeta 그대로라서, 현재 page/size 반영해서 UI 안정화
      setMeta({
        ...m,
        page,
        size,
        totalElements: typeof m.totalElements === "number" ? m.totalElements : list.length,
        totalPages: typeof m.totalPages === "number" ? m.totalPages : 1,
        hasNext: typeof m.hasNext === "boolean" ? m.hasNext : false,
        hasPrev: typeof m.hasPrev === "boolean" ? m.hasPrev : page > 1,
      });
    } catch (e: any) {
      console.error("[useCategoryList]", e);
      setError(e?.message ?? "카테고리 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [scope, query, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state: {
      items,
      meta, // ✅ 항상 PageMeta
      page,
      size,
      keyword,
      loading,
      error,
      scope,
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
