"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./StudentCurricularEnrollmentPageClient.module.css";
import { PaginationSimple, useListQuery } from "@/components/pagination";

import type { CurricularEnrollmentListItemDto } from "../../api/types";
import { useCurricularEnrollmentsList } from "../../hooks/useCurricularEnrollmentList";
import { StudentCurricularEnrollmentsTable } from "./StudentEnrollmentsTable";

import { ConfirmDialog } from "@/components/modal/ConfirmDialog"; // ✅ 경로가 다르면 수정
import { cancelCurricularOffering } from "../../api/curricularApi"; // ✅ 네가 만든 cancel 함수 있는 파일로 경로 수정

export default function StudentCurricularEnrollmentPageClient() {
  const router = useRouter();
  const { state, actions } = useCurricularEnrollmentsList();

  // pagination
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  // ✅ confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<CurricularEnrollmentListItemDto | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // 신청취소 버튼 클릭 -> 모달 오픈
  const handleCancelClick = useCallback((row: CurricularEnrollmentListItemDto) => {
    setTarget(row);
    setConfirmOpen(true);
  }, []);

  // 모달 닫기
  const closeConfirm = useCallback(() => {
    if (cancelLoading) return;
    setConfirmOpen(false);
    setTarget(null);
  }, [cancelLoading]);

  // 모달 확인(취소 실행)
  const handleConfirmCancel = useCallback(async () => {
    if (!target) return;

    try {
      setCancelLoading(true);

      // ✅ 실제 취소 API 호출
      await cancelCurricularOffering(target.offeringId);

      toast.success("신청이 취소되었습니다.");
      await actions.reload();

      setConfirmOpen(false);
      setTarget(null);
    } catch (e: any) {
      console.error("[cancelCurricularOffering]", e);
      toast.error(e?.error?.message ?? e?.message ?? "신청 취소에 실패했습니다.");
    } finally {
      setCancelLoading(false);
    }
  }, [target, actions]);

  // row 클릭 -> 운영 상세로 이동
  const handleRowClick = useCallback(
    (row: CurricularEnrollmentListItemDto) => {
      router.push(`/student/curricular/offerings/${row.offeringId}`);
    },
    [router]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>수강 신청현황</h1>

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

        {/* ✅ Confirm Modal */}
        <ConfirmDialog
          open={confirmOpen}
          title="신청 취소"
          description={
            target ? (
              <>
                아래 교과목 신청을 취소하시겠습니까?
                <br />
                <b>{target.curricularName}</b> ({target.offeringCode})
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
