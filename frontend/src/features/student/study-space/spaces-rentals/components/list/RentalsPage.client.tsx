"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./RentalsPage.module.css";
import RentalsTable from "./RentalsTable";
import { Button } from "@/components/button";
import { useRental } from "../../hooks/useRental";
import type { RentalDto } from "../../api/types";

// ✅ 공용 pagination (SpacesPageClient와 동일 사용)
import { PaginationSimple, useListQuery } from "@/components/pagination";

type RejectModalState = {
  open: boolean;
  rentalId: number | null;
  reason: string;
};

export default function RentalsPageClient() {
  // ✅ URL query와 연동되는 공용 pagination
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const {
    me,
    meLoading,
    meError,
    hasRentalRead,

    data,
    meta,
    loading,
    error,
    updateParams,

    cancelRental,
    fetchRejectionReason,
    refresh,
  } = useRental({ page, size });

  const [rejectModal, setRejectModal] = useState<RejectModalState>({
    open: false,
    rentalId: null,
    reason: "",
  });

  useEffect(() => {
    updateParams({ page, size });
    }, [page, size]);

  const title = useMemo(() => {
    const id = me?.loginId ? `(${me.loginId})` : "";
    return `내 예약 목록 ${id}`;
  }, [me?.loginId]);

  const openRejectModal = async (r: RentalDto) => {
    const reason = await fetchRejectionReason(r);
    setRejectModal({
      open: true,
      rentalId: r.rentalId,
      reason: reason || "반려 사유가 없습니다.",
    });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, rentalId: null, reason: "" });
  };

  if (meLoading) {
    return <div className={styles.page}>내 정보 확인 중...</div>;
  }

  if (meError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>{meError}</div>
        <Button variant="secondary" onClick={refresh}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!hasRentalRead) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>예약 조회 권한이 없습니다. (RENTAL_READ)</div>
      </div>
    );
  }

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{title}</h1>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={refresh}>
            새로고침
          </Button>
        </div>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <RentalsTable
        items={data}
        loading={loading}
        onCancel={cancelRental}
        onShowRejectReason={openRejectModal}
      />

      {/* ✅ SpacesPageClient와 동일하게 PaginationSimple 사용 */}
      <div className={styles.bottomRow}>
        <div className={styles.paginationWrap}>
          <PaginationSimple page={page} totalPages={totalPages} onChange={(p: number) => setPage(p)} />
        </div>
      </div>

      {/* ✅ 반려 사유 모달 */}
      {rejectModal.open && (
        <div className={styles.modalOverlay} onMouseDown={closeRejectModal}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalTop}>
              <div className={styles.modalTitle}>반려 사유</div>
              <button className={styles.closeBtn} onClick={closeRejectModal} aria-label="close">
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.reasonBox}>{rejectModal.reason}</div>
            </div>

            <div className={styles.modalBottom}>
              <Button variant="primary" onClick={closeRejectModal}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
