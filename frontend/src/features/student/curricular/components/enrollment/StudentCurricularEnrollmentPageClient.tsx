"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentCurricularEnrollmentPageClient.module.css";
import type { CurricularEnrollmentListItemDto } from "../../api/types";
import { useCurricularEnrollmentsList } from "../../hooks/useCurricularEnrollmentList";
import { StudentCurricularEnrollmentsTable } from "./StudentEnrollmentsTable";
import { cancelCurricularOffering } from "../../api/curricularApi";

export default function StudentCurricularEnrollmentPageClient() {
  const router = useRouter();
  const { state, actions } = useCurricularEnrollmentsList();
  const t = useI18n("curricular.studentEnrollments");
  const tCommon = useI18n("curricular.common");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<CurricularEnrollmentListItemDto | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancelClick = useCallback((row: CurricularEnrollmentListItemDto) => {
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
      await cancelCurricularOffering(target.offeringId);

      toast.success(t("messages.cancelSuccess"));
      await actions.reload();

      setConfirmOpen(false);
      setTarget(null);
    } catch (e: any) {
      console.error("[cancelCurricularOffering]", e);
      toast.error(e?.error?.message ?? e?.message ?? t("messages.cancelFailed"));
    } finally {
      setCancelLoading(false);
    }
  }, [target, actions, t]);

  const handleRowClick = useCallback(
    (row: CurricularEnrollmentListItemDto) => {
      router.push(`/student/curricular/offerings/${row.offeringId}`);
    },
    [router]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudentCurricularEnrollmentsTable
          items={state.items}
          loading={state.loading}
          onCancelClick={handleCancelClick}
          onRowClick={handleRowClick}
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
          title={t("dialog.title")}
          description={
            target ? (
              <>
                {t("dialog.description")}
                <br />
                <b>{target.curricularName}</b> ({target.offeringCode})
              </>
            ) : null
          }
          confirmText={t("dialog.confirmText")}
          cancelText={tCommon("cancelButton")}
          danger
          loading={cancelLoading}
          onCancel={closeConfirm}
          onConfirm={handleConfirmCancel}
        />
      </div>
    </div>
  );
}
