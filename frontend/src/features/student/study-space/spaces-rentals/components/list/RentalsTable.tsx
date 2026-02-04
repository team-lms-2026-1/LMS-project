    "use client";

    import styles from "./RentalsTable.module.css"; // 없으면 Spaces/기존 table css로 바꿔도 됨
    import { Button } from "@/components/button";
    import type { RentalDto, RentalStatus } from "../../api/types";

    type Props = {
    items: RentalDto[];
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

    export default function RentalsTable({ items, loading, onCancel, onShowRejectReason }: Props) {
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
            items.map((r) => (
                <div key={r.rentalId} className={styles.row}>
                <div className={styles.colId}>{r.rentalId}</div>
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
                    <Button variant="danger" onClick={() => onShowRejectReason(r)}>
                        반려됨
                    </Button>
                    )}

                    {r.status === "APPROVED" && (
                    <Button variant="primary" disabled>
                        허가
                    </Button>
                    )}

                    {r.status === "CANCELLED" && (
                    <Button variant="secondary" disabled>
                        취소됨
                    </Button>
                    )}
                </div>
                </div>
            ))
            )}
        </div>
        </div>
    );
    }
