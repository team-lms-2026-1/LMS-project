"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchMbtiQuestions, fetchMbtiResult } from "../api/mbtiApi";
import { MbtiQuestion, MbtiResult } from "../api/types";

// 상세 기본
export function useMbtiQuestions(enabled: boolean = true) {
  const [data, setData] = useState<MbtiQuestion[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMbtiQuestions();
      setData(res.data);
    } catch (e) {
      console.error("[useMbtiQuestions]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled]);

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}


// 상세 기본
export function useMbtiResult(enabled: boolean = true) {
  const [data, setData] = useState<MbtiResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMbtiResult();
      setData(res.data);
    } catch (e) {
      console.error("[useMbtiResult]", e);
      setError("조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled]);

  return { state: { data, loading, error }, actions: { load, reload, setData } };
}
