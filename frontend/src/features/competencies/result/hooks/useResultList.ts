"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResultCompetencyDashboard } from "@/features/competencies/result/api/types";
import {
  fetchResultCompetencyDashboard,
  type ResultCompetencyQuery,
} from "@/features/competencies/result/api/ResultCompetenciesApi";

type ResultListMessages = {
  loadFailed?: string;
};

export function useResultList(
  query?: ResultCompetencyQuery,
  enabled: boolean = true,
  messages?: ResultListMessages
) {
  const [data, setData] = useState<ResultCompetencyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextQuery?: ResultCompetencyQuery) => {
      if (!enabled) return;
      try {
        setLoading(true);
        setError(null);
        const effectiveQuery = nextQuery ?? query ?? {};
        const res = await fetchResultCompetencyDashboard(effectiveQuery);
        setData(res.data ?? null);
      } catch (e: any) {
        console.error("[useResultList]", e);
        setError(e?.message ?? messages?.loadFailed ?? "Failed to load competency summary results.");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [
      enabled,
      messages?.loadFailed,
      query?.dignosisId,
      query?.deptId,
      query?.deptName,
      query?.semesterId,
      query?.semesterName,
    ]
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void load();
  }, [enabled, load]);

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
