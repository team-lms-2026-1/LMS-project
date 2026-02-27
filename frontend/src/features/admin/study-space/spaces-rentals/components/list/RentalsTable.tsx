import React from "react";
import styles from "./RentalsPage.module.css";
import type { RentalDto } from "../../api/types";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  data: RentalDto[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

export default function RentalsTable({ data, loading, onApprove, onReject }: Props) {
  const t = useI18n("studySpace.admin.rentals.table");

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>{t("loading")}</div>;
  if (!data || data.length === 0) return <div style={{ padding: 40, textAlign: "center" }}>{t("empty")}</div>;

  // ✅ 내림차순 정렬 (원본 data 변형 방지)
  const sorted = [...data].sort((a, b) => (b.rentalId ?? 0) - (a.rentalId ?? 0));

  return (
    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          <th className={styles.th}>{t("headers.id")}</th>
          <th className={styles.th}>{t("headers.space")}</th>
          <th className={styles.th}>{t("headers.room")}</th>
          <th className={styles.th}>{t("headers.applicant")}</th>
          <th className={styles.th}>{t("headers.date")}</th>
          <th className={styles.th}>{t("headers.time")}</th>
          <th className={styles.th}>{t("headers.requestedAt")}</th>
          <th className={styles.th}></th>
        </tr>
      </thead>

      <tbody className={styles.tbody}>
        {sorted.map((item) => (
          <tr key={item.rentalId}>
            <td className={styles.td}>{item.rentalId}</td>
            <td className={styles.td}>{item.space.spaceName}</td>
            <td className={styles.td}>{item.room.roomName}</td>
            <td className={styles.td} style={{ fontWeight: "bold" }}>
              {item.applicant.name || t("userFallback", { id: item.applicant.accountId })}
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
                    {t("statuses.canceled")}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={item.status === "APPROVED" ? "secondary" : "primary"}
                      disabled={item.status === "APPROVED"}
                      onClick={() => onApprove(item.rentalId)}
                    >
                      {t("buttons.approve")}
                    </Button>
                    <Button
                      variant={item.status === "REJECTED" ? "secondary" : "danger"}
                      disabled={item.status === "REJECTED"}
                      onClick={() => onReject(item.rentalId)}
                    >
                      {t("buttons.reject")}
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
