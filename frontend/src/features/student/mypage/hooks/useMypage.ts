"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import { fetchStudentMypage } from "../api/mypageApi";
import type { StudentMypageResponse } from "../api/types";

export function useStudentMypage(enabled: boolean = true, initialData: StudentMypageResponse | null = null) {
  const t = useI18n("mypage.student.hook");
  const [data, setData] = useState<StudentMypageResponse | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchStudentMypage();
      if (res?.data) {
        setData(res.data);
      } else {
        setError(t("errors.emptyData"));
      }
    } catch (e) {
      console.error("[useStudentMypage]", e);
      setError(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    load();
  }, [enabled]);

  return { data, loading, error, load };
}
