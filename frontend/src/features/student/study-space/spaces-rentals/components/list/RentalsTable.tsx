"use client";

import styles from "./RentalsTable.module.css";
import { Button } from "@/components/button";
import type { RentalDto, RentalStatus, PageMeta } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: RentalDto[];
  meta?: PageMeta | null;
  loading?: boolean;

  onCancel: (rentalId: number) => void;
  onShowRejectReason: (r: RentalDto) => void;
};

function statusLabel(s: RentalStatus, t: ReturnType<typeof useI18n>) {
  switch (s) {
    case "REQUESTED":
      return t("statuses.requested");
    case "APPROVED":
      return t("statuses.approved");
    case "REJECTED":
      return t("statuses.rejected");
    case "CANCELLED":
      return t("statuses.cancelled");
    default:
      return s;
  }
}

/**
 * ✅ 내림차순 번호 계산
 * - totalElements: 전체 개수
 * - page: 현재 페이지 (1-based 가정)
 * - size: 페이지 크기
 *
 * 만약 page가 0-based(0부터 시작)면 아래 page 계산에서 +1 해줘야 함.
 */
function calcRowNo(meta: PageMeta | null | undefined, indexInPage: number, fallbackCount: number) {
  const total = (meta as any)?.totalElements ?? fallbackCount;
  const size = (meta as any)?.size ?? fallbackCount;

  // ✅ 기본은 1-based 페이지로 가정
  const page = (meta as any)?.page ?? 1;

  // 0-based 페이지라면 아래처럼 바꿔서 사용:
  // cleaned comment

  return total - ((page - 1) * size + indexInPage);
}

export default function RentalsTable({
  items,
  meta,
  loading,
  onCancel,
  onShowRejectReason,
}: Props) {
  const t = useI18n("studySpace.student.rentals.table");

  return (
    <div className={styles.wrap}>
      <div className={styles.table}>
        <div className={styles.head}>
          <div className={styles.colId}>{t("headers.id")}</div>
          <div className={styles.colSpace}>{t("headers.space")}</div>
          <div className={styles.colRoom}>{t("headers.room")}</div>
          <div className={styles.colDate}>{t("headers.date")}</div>
          <div className={styles.colTime}>{t("headers.time")}</div>
          <div className={styles.colStatus}>{t("headers.status")}</div>
          <div className={styles.colActions}>{t("headers.actions")}</div>
        </div>

        {loading ? (
          <div className={styles.empty}>{t("loading")}</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>{t("empty")}</div>
        ) : (
          items.map((r, idx) => {
            const no = calcRowNo(meta, idx, items.length);

            return (
              <div key={r.rentalId} className={styles.row}>
                {/* ✅ rentalId 대신 내림차순 번호 */}
                <div className={styles.colId}>{no}</div>

                <div className={styles.colSpace}>{r.spaceName ?? "-"}</div>
                <div className={styles.colRoom}>{r.roomName ?? "-"}</div>
                <div className={styles.colDate}>{r.date}</div>

                <div className={styles.colTime}>
                  {r.startTime} ~ {r.endTime}
                </div>

                <div className={styles.colStatus}>
                  <span className={styles.badge} data-status={r.status}>
                    {statusLabel(r.status, t)}
                  </span>
                </div>

                <div className={styles.colActions}>
                  {r.status === "REQUESTED" && (
                    <Button variant="secondary" onClick={() => onCancel(r.rentalId)}>
                      {t("buttons.cancel")}
                    </Button>
                  )}

                  {r.status === "REJECTED" && (
                    <>
                      <Button variant="danger" onClick={() => onShowRejectReason(r)}>
                        {t("buttons.rejected")}
                      </Button>
                    </>
                  )}

                  {r.status === "APPROVED" && (
                    <>
                      <Button variant="primary" disabled>
                        {t("buttons.approved")}
                      </Button>
                      <Button variant="secondary" onClick={() => onCancel(r.rentalId)}>
                        {t("buttons.cancel")}
                      </Button>
                    </>
                  )}

                  {r.status === "CANCELLED" && (
                    <Button variant="secondary" disabled>
                      {t("buttons.cancelled")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
