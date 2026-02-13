"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StudentCompetencyDashboard } from "../api/types";
import { fetchStudentResultDashboard } from "../api/StudentResultApi";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { useAuth } from "@/features/auth/AuthProvider";

export type UseStudentResultState = {
  data: StudentCompetencyDashboard | null;
  loading: boolean;
  error: string | null;
  semesterId: string;
  semesterOptions: Array<{ value: string; label: string }>;
  semesterLoading: boolean;
  authLoading: boolean;
};

export type UseStudentResultActions = {
  setSemesterId: (value: string) => void;
  reload: () => Promise<void>;
};

export function useStudentResult(): { state: UseStudentResultState; actions: UseStudentResultActions } {
  const { state: authState } = useAuth();
  const { options: semesterOptions, loading: semesterLoading } = useSemestersDropdownOptions();
  const [semesterId, setSemesterId] = useState("");
  const [data, setData] = useState<StudentCompetencyDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentId = authState.me?.accountId;

  const reload = useCallback(async () => {
    if (!studentId || !semesterId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentResultDashboard({ studentId, semesterId });
      setData(res.data ?? null);
    } catch (e: any) {
      setError(e?.message ?? "역량 결과를 불러오지 못했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [semesterId, studentId]);

  useEffect(() => {
    if (!studentId || !semesterId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetchStudentResultDashboard({ studentId, semesterId });
        if (!alive) return;
        setData(res.data ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "역량 결과를 불러오지 못했습니다.");
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [studentId, semesterId]);

  return {
    state: {
      data,
      loading: loading || authState.loading,
      error,
      semesterId,
      semesterOptions,
      semesterLoading,
      authLoading: authState.loading,
    },
    actions: {
      setSemesterId,
      reload,
    },
  };
}
