"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import DignosisPageClient from "../../list/DignosisPage.client";
import { DignosisDetailModal } from "./DignosisDetailModal.client";

type Props = {
  dignosisId: string;
};

export default function DignosisDetailPageClient({ dignosisId }: Props) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.push("/student/competencies/dignosis");
  }, [router]);

  return (
    <>
      <DignosisPageClient />
      <DignosisDetailModal open onClose={handleClose} dignosisId={dignosisId} onSubmitted={handleClose} />
    </>
  );
}
