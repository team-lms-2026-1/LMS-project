"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResultCompetencyDashboard } from "@/features/competencies/result/api/types";
import {
  fetchResultCompetencyDashboard,
  type ResultCompetencyQuery,
} from "@/features/competencies/result/api/ResultCompetenciesApi";

export function useResultList(query?: ResultCompetencyQuery) {
  const [data, setData] = useState<ResultCompetencyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextQuery?: ResultCompetencyQuery) => {
    try {
      setLoading(true);
      setError(null);
      const effectiveQuery = nextQuery ?? query;
      if (!effectiveQuery?.dignosisId) {
        setData(null);
        setError("진단 ID가 없습니다.");
        return;
      }
      const res = await fetchResultCompetencyDashboard(effectiveQuery);
      setData(res.data ?? null);
    } catch (e: any) {
      console.error("[useResultList]", e);
      setError(e?.message ?? "역량 통합 결과를 불러오지 못했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query?.dignosisId, query?.deptId, query?.deptName]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state: {
      data,
      loading,
      error,
    },
    actions: {
      reload: load,
    },
  };
}
