"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DignosisPageClient from "@/features/competencies/diagnosis/components/list/DignosisPage.client";
import DignosisDeleteModal from "./DignosisDeleteModal.client";
import type { DiagnosisDeletePageProps } from "@/features/competencies/diagnosis/api/types";
import {
  deleteDiagnosis,
  fetchDiagnosisDetail,
} from "@/features/competencies/diagnosis/api/DiagnosisApi";

export default function DignosisDeletePageClient({ dignosisId }: DiagnosisDeletePageProps) {
  const router = useRouter();
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);

    (async () => {
      try {
        const res = await fetchDiagnosisDetail(dignosisId);
        const data = (res as any)?.data ?? res ?? {};
        if (!alive) return;
        setTitle(data?.title ?? data?.diagnosisTitle ?? undefined);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "진단지 정보를 불러오지 못했습니다.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [dignosisId]);

  const handleClose = useCallback(() => {
    router.push("/admin/competencies/dignosis");
  }, [router]);

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDiagnosis(dignosisId);
      router.push("/admin/competencies/dignosis");
    } catch (e: any) {
      const message = e?.message ?? "진단지 삭제에 실패했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [dignosisId, loading, router]);

  useEffect(() => {
    if (!error) return;
    window.alert(error);
  }, [error]);

  return (
    <>
      <DignosisPageClient />
      <DignosisDeleteModal
        open
        targetTitle={title}
        loading={loading}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </>
  );
}
