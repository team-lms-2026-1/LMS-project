"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./StudentExtraCurricularEnrollmentPageClient.module.css";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";

import type { ExtraCurricularEnrollmentListItemDto } from "../../api/types";
import { useStudentExtraCurricularEnrollmentsList } from "../../hooks/useExtraCurricularOfferingList";
import { StudentExtraCurricularEnrollmentsTable } from "./StudentExtraEnrollmentsTable";
import { cancelExtraCurricularOffering } from "../../api/extraCuccicularApi";

export default function StudentExtraCurricularEnrollmentPageClient() {
  const router = useRouter();
  const { state, actions } = useStudentExtraCurricularEnrollmentsList();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<ExtraCurricularEnrollmentListItemDto | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancelClick = useCallback((row: ExtraCurricularEnrollmentListItemDto) => {
    setTarget(row);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    if (cancelLoading) return;
    setConfirmOpen(false);
    setTarget(null);
  }, [cancelLoading]);

  const handleConfirmCancel = useCallback(async () => {
    if (!target) return;

    try {
      setCancelLoading(true);
      await cancelExtraCurricularOffering(target.extraOfferingId);

      toast.success("신청이 취소되었습니다.");
      await actions.reload();

      setConfirmOpen(false);
      setTarget(null);
    } catch (e: any) {
      console.error("[cancelExtraCurricularOffering]", e);
      toast.error(e?.error?.message ?? e?.message ?? "신청 취소에 실패했습니다.");
    } finally {
      setCancelLoading(false);
    }
  }, [target, actions]);

  const handleRowClick = useCallback(
    (row: ExtraCurricularEnrollmentListItemDto) => {
      router.push(`/student/extra-curricular/offerings/${row.extraOfferingId}`);
    },
    [router]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>비교과 신청현황</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudentExtraCurricularEnrollmentsTable
          items={state.items}
          loading={state.loading}
          onCancelClick={handleCancelClick}
          onRowClick={handleRowClick}
          isCancelDisabled={(row) => !["OPEN", "ENROLLMENT_CLOSED"].includes(row.status)}
        />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="신청 취소"
          description={
            target ? (
              <>
                아래 비교과 신청을 취소하시겠습니까?
                <br />
                <b>{target.extraOfferingName}</b> ({target.extraOfferingCode})
              </>
            ) : null
          }
          confirmText="신청취소"
          cancelText="닫기"
          danger
          loading={cancelLoading}
          onCancel={closeConfirm}
          onConfirm={handleConfirmCancel}
        />
      </div>
    </div>
  );
}
