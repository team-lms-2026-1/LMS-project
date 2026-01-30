"use client";

import { useCallback, useEffect, useState } from "react";
import type { QnaListItemDto, PageMeta } from "../api/types";
import { fetchQnaList, deleteQnaQuestion } from "../api/QnasApi"; // ✅ delete 추가

const defaultMeta: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export function useQnaList() {
  const [items, setItems] = useState<QnaListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  const [deptId, setDeptId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchQnaList({
        page,
        size,
        keyword: keyword || undefined,
      });

      setItems(res.data ?? []);
      setMeta(res.meta ?? defaultMeta);
    } catch (e: any) {
      console.error("[useQnasList]", e);
      setError(e?.message ?? "Q&A 목록 조회 실패");
      setItems([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  }, [page, size, deptId, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  /** ✅ 질문 삭제 */
  const deleteQuestion = useCallback(
    async (questionId: number) => {
      // optimistic update
      const prev = items;
      setItems((cur) => cur.filter((q) => q.questionId !== questionId));

      try {
        await deleteQnaQuestion(questionId);
        // 메타/페이지 반영이 필요하면 reload 호출
        await load();
      } catch (e: any) {
        // rollback
        setItems(prev);
        throw e;
      }
    },
    [items, load]
  );

  return {
    state: {
      items,
      meta, // ✅ 항상 PageMeta
      page,
      size,
      deptId,
      keyword,
      loading,
      error,
    },
    actions: {
      setKeyword,
      deleteQuestion, // ✅ 이제 실제 존재
      search: () => setPage(1),
      goPage: (p: number) => setPage(p),

      setSize: (s: number) => {
        setPage(1);
        setSize(s);
      },

      setDeptId: (id: number | null) => {
        setPage(1);
        setDeptId(id);
      },

      reload: load,
    },
  };
}
