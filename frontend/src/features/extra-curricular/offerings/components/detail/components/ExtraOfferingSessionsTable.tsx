"use client";

import { Table, type TableColumn } from "@/components/table";

import styles from "./ExtraOfferingSessionsTable.module.css"
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { ExtraSessionListItemDto } from "../../../api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  offeringId: number;
  items: ExtraSessionListItemDto[];
  loading: boolean;
  expandedSessionId?: number | null;
  onRowClick?: (row: ExtraSessionListItemDto) => void;
};

export function ExtraOfferingSessionsTable({ offeringId, items, loading, onRowClick }: Props) {
  const t = useI18n("extraCurricular.adminOfferingDetail.sessions");
  const tStatus = useI18n("extraCurricular.status.session");

  const sessionStatusLabel = (value: string) => {
    switch (value) {
      case "OPEN":
        return tStatus("OPEN");
      case "CLOSED":
        return tStatus("CLOSED");
      case "CANCELED":
        return tStatus("CANCELED");
      default:
        return value;
    }
  };

  const columns: Array<TableColumn<ExtraSessionListItemDto>> = [
    { header: t("headers.sessionName"), align: "center", render: (r) => r.sessionName },
    { header: t("headers.rewardPoint"), align: "center", render: (r) => r.rewardPoint },
    { header: t("headers.recognizedHours"), align: "center", render: (r) => r.recognizedHours },
    { header: t("headers.startAt"), align: "center", render: (r) => r.startAt },
    { header: t("headers.endAt"), align: "center", render: (r) => r.endAt },
    {
      header: t("headers.status"),
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.status as any}
          label={sessionStatusLabel(r.status)}
        />
      ),
    },
    {
      header: t("headers.manage"),
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick?.(r);
            }} 
          >
            {t("buttons.detail")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<ExtraSessionListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.sessionId}
      emptyText={t("emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
