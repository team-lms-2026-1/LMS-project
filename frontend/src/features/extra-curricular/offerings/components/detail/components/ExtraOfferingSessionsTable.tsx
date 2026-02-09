"use client";

import { Table, type TableColumn } from "@/components/table";

import styles from "./ExtraOfferingSessionsTable.module.css"
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { ExtraSessionListItemDto } from "../../../api/types";

type Props = {
  offeringId: number;
  items: ExtraSessionListItemDto[];
  loading: boolean;
  expandedSessionId?: number | null;
  onRowClick?: (row: ExtraSessionListItemDto) => void;
};

export function ExtraOfferingSessionsTable({ offeringId, items, loading, onRowClick }: Props) {
  const columns: Array<TableColumn<ExtraSessionListItemDto>> = [
    { header: "회차명", align: "center", render: (r) => r.sessionName },
    { header: "회차포인트", align: "center", render: (r) => r.rewardPoint },
    { header: "회차인정시간", align: "center", render: (r) => r.recognizedHours },
    { header: "시작기간", align: "center", render: (r) => r.startAt },
    { header: "마감기간", align: "center", render: (r) => r.endAt },
    {
      header: "상태",
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.status as any}
          label={r.status}
        />
      ),
    },
    {
      header: "관리",
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
            상세
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
      emptyText="회차가 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
