"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import DignosisPageClient from "@/features/competencies/diagnosis/components/list/DignosisPage.client";
import { DignosisCreateModal } from "./DignosisCreateModal.client";

export default function DignosisCreatePageClient() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.push("/admin/competencies/dignosis");
  }, [router]);

  return (
    <>
      <DignosisPageClient />
      <DignosisCreateModal open onClose={handleClose} />
    </>
  );
}
