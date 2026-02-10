"use client";

import { useCallback, useEffect, useState } from "react";
import type { DeptListItemDto, PageMeta } from "../api/types";
import { fetchDeptList } from "../api/deptsApi";

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10; // PaginationSimple 기본이 10이라면 맞춰주는 게 편함

const defaultMeta: PageMeta = {
  page: DEFAULT_PAGE,
  size: DEFAULT_SIZE,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useDeptList() {
  const [items, setItems] = useState<DeptListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchDeptList({
        page,
        size,
        keyword: keyword.trim() || undefined, // 공백만 있으면 안 보냄
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      console.error("[useDeptList]", e);
      setError(e.message ?? "학과 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);

  useEffect(() => {
    load();
  }, [load]);

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
      /** 검색어 바꾸기 + 자동으로 1페이지로 리셋 */
      setKeyword: (value: string) => {
        setKeyword(value);
        setPage(1); // keyword 바뀌면 1페이지부터
      },

      /** 페이지 이동 */
      goPage: (p: number) => {
        setPage(p);
      },

      /** 페이지 사이즈 변경 (1페이지로 리셋) */
      setSize: (s: number) => {
        setSize(s);
        setPage(1);
      },

      setDeptId: (id: number | null) => {
        setPage(1);
      },
      /** 강제 새로고침 */
      reload: load,
    },
  };
}
