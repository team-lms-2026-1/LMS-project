"use client";

import styles from "./RentalsTable.module.css";
import { Button } from "@/components/button";
import type { RentalDto, RentalStatus, PageMeta } from "../../api/types";

type Props = {
  items: RentalDto[];
  meta?: PageMeta | null;
  loading?: boolean;

  onCancel: (rentalId: number) => void;
  onShowRejectReason: (r: RentalDto) => void;
};

function statusLabel(s: RentalStatus) {
  switch (s) {
    case "REQUESTED":
      return "요청됨";
    case "APPROVED":
      return "허가";
    case "REJECTED":
      return "반려";
    case "CANCELLED":
      return "취소됨";
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
  // const page = ((meta as any)?.page ?? 0) + 1;

  return total - ((page - 1) * size + indexInPage);
}

export default function RentalsTable({
  items,
  meta,
  loading,
  onCancel,
  onShowRejectReason,
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.table}>
        <div className={styles.head}>
          <div className={styles.colId}>번호</div>
          <div className={styles.colSpace}>학습공간</div>
          <div className={styles.colRoom}>스터디룸</div>
          <div className={styles.colDate}>날짜</div>
          <div className={styles.colTime}>시간</div>
          <div className={styles.colStatus}>상태</div>
          <div className={styles.colActions}>처리</div>
        </div>

        {loading ? (
          <div className={styles.empty}>불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>예약 내역이 없습니다.</div>
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
                    {statusLabel(r.status)}
                  </span>
                </div>

                <div className={styles.colActions}>
                  {r.status === "REQUESTED" && (
                    <Button variant="secondary" onClick={() => onCancel(r.rentalId)}>
                      취소하기
                    </Button>
                  )}

                  {r.status === "REJECTED" && (
                    <>
                      <Button variant="danger" onClick={() => onShowRejectReason(r)}>
                        반려됨
                      </Button>
                    </>
                  )}

                  {r.status === "APPROVED" && (
                    <>
                      <Button variant="primary" disabled>
                        허가
                      </Button>
                      <Button variant="secondary" onClick={() => onCancel(r.rentalId)}>
                        취소하기
                      </Button>
                    </>
                  )}

                  {r.status === "CANCELLED" && (
                    <Button variant="secondary" disabled>
                      취소됨
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
