import React, { useMemo } from "react";
import styles from "./RentalsPage.module.css";
import type { RentalDto } from "../../api/types";
import { Button } from "@/components/button";

type Props = {
  data: RentalDto[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

export default function RentalsTable({ data, loading, onApprove, onReject }: Props) {
  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>로딩 중...</div>;
  if (!data || data.length === 0) return <div style={{ padding: 40, textAlign: "center" }}>신청 내역이 없습니다.</div>;

  // ✅ 내림차순 정렬 (원본 data 변형 방지)
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => (b.rentalId ?? 0) - (a.rentalId ?? 0));
  }, [data]);

  return (
    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          <th className={styles.th}>번호</th>
          <th className={styles.th}>장소</th>
          <th className={styles.th}>이름</th>
          <th className={styles.th}>신청자</th>
          <th className={styles.th}>예약 날짜</th>
          <th className={styles.th}>예약 시간</th>
          <th className={styles.th}>요청 일시</th>
          <th className={styles.th}></th>
        </tr>
      </thead>

      <tbody className={styles.tbody}>
        {sorted.map((item) => (
          <tr key={item.rentalId}>
            <td className={styles.td}>{String(item.rentalId).padStart(5, "0")}</td>
            <td className={styles.td}>{item.space.spaceName}</td>
            <td className={styles.td}>{item.room.roomName}</td>
            <td className={styles.td} style={{ fontWeight: "bold" }}>
              {item.applicant.name || `User#${item.applicant.accountId}`}
            </td>
            <td className={styles.td} style={{ fontWeight: "bold" }}>{item.rentalDate}</td>
            <td className={styles.td} style={{ fontWeight: "bold" }}>
              {item.startTime} ~ {item.endTime}
            </td>
            <td className={styles.td} style={{ fontWeight: "bold" }}>{item.requestedAt}</td>
            <td className={styles.td}>
              <div className={styles.btnGroup}>
                {item.status === "CANCELED" ? (
                  <Button
                    variant="secondary"
                    disabled
                    style={{ backgroundColor: "#e5e7eb", color: "#9ca3af", borderColor: "#e5e7eb" }}
                  >
                    취소됨
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={item.status === "APPROVED" ? "secondary" : "primary"}
                      disabled={item.status === "APPROVED"}
                      onClick={() => onApprove(item.rentalId)}
                      style={{ padding: "6px 12px", fontSize: "13px", height: "auto", minHeight: "unset" }}
                    >
                      허가
                    </Button>
                    <Button
                      variant={item.status === "REJECTED" ? "secondary" : "danger"}
                      disabled={item.status === "REJECTED"}
                      onClick={() => onReject(item.rentalId)}
                      style={{ padding: "6px 12px", fontSize: "13px", height: "auto", minHeight: "unset" }}
                    >
                      반려
                    </Button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
