"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudentCompetencyDashboard } from "../api/types";
import { fetchStudentResultDashboard } from "../api/StudentResultApi";
import { useAuth } from "@/features/auth/AuthProvider";

export type UseStudentResultState = {
  data: StudentCompetencyDashboard | null;
  loading: boolean;
  error: string | null;
  semesterId: string;
  authLoading: boolean;
};

export type UseStudentResultActions = {
  setSemesterId: (value: string) => void;
  reload: () => Promise<void>;
};

type StudentResultMessages = {
  loadFailed?: string;
};

export function useStudentResult(
  messages?: StudentResultMessages
): { state: UseStudentResultState; actions: UseStudentResultActions } {
  const { state: authState } = useAuth();
  const [semesterId, setSemesterId] = useState("");
  const [data, setData] = useState<StudentCompetencyDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentId = authState.me?.accountId;

  const loadFailedMessage = messages?.loadFailed ?? "Failed to load competency results.";

  const reload = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentResultDashboard({ studentId, semesterId });
      setData(res.data ?? null);
    } catch (e: any) {
      setError(e?.message ?? loadFailedMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [loadFailedMessage, semesterId, studentId]);

  useEffect(() => {
    if (!studentId) {
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
        setError(e?.message ?? loadFailedMessage);
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [loadFailedMessage, studentId, semesterId]);

  return {
    state: {
      data,
      loading: loading || authState.loading,
      error,
      semesterId,
      authLoading: authState.loading,
    },
    actions: {
      setSemesterId,
      reload,
    },
  };
}
