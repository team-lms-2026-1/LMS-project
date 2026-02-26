"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DignosisPageClient from "@/features/admin/competencies/diagnosis/components/list/DignosisPage.client";
import { DignosisCreateModal } from "./DignosisCreateModal.client";
import { createDiagnosis } from "@/features/admin/competencies/diagnosis/api/DiagnosisApi";
import type { DiagnosisCreatePayload } from "@/features/admin/competencies/diagnosis/api/types";

export default function DignosisCreatePageClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    router.push("/admin/competencies/dignosis");
  }, [router]);

  const handleSubmit = useCallback(
    async (payload: DiagnosisCreatePayload) => {
      if (saving) return false;
      setSaving(true);
      setError(null);
      try {
        await createDiagnosis(payload);
        toast.success("진단지가 등록되었습니다.", { style: { zIndex: 12000 } });
        return true;
      } catch (e: any) {
        const message = e?.message ?? "진단지 등록이 실패했습니다.";
        setError(message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [saving]
  );

  useEffect(() => {
    if (!error) return;
    toast.error(error, { style: { zIndex: 12000 } });
  }, [error]);

  return (
    <>
      <DignosisPageClient />
      <DignosisCreateModal open onClose={handleClose} onSubmit={handleSubmit} />
    </>
  );
}
