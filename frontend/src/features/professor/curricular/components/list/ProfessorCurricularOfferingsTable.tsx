"use client";

import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { Table, type TableColumn } from "@/components/table";

import type { CurricularOfferingListItemDto } from "../../api/types";
import { offeringStatusLabel } from "../../utils/statusLabel";
import styles from "./ProfessorCurricularOfferingsTable.module.css";

type Props = {
  items: CurricularOfferingListItemDto[];
  loading: boolean;
  onRowClick?: (row: CurricularOfferingListItemDto) => void;
};

export function ProfessorCurricularOfferingsTable({ items, loading, onRowClick }: Props) {
  const columns: Array<TableColumn<CurricularOfferingListItemDto>> = [
    { header: "개설코드", align: "center", render: (r) => r.offeringCode },
    { header: "교과목명", align: "center", render: (r) => r.curricularName },
    { header: "정원", align: "center", render: (r) => r.capacity },
    { header: "담당교수", align: "center", render: (r) => r.professorName },
    { header: "학기", align: "center", render: (r) => r.semesterName },
    { header: "장소", align: "center", render: (r) => r.location },
    { header: "학점", align: "center", render: (r) => r.credit },
    {
      header: "상태",
      align: "center",
      render: (r) => (
        <StatusPill status={r.status as any} label={offeringStatusLabel(r.status)} />
      ),
    },
    {
      header: "관리",
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button
            variant="secondary"
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
    <Table<CurricularOfferingListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.offeringId}
      emptyText="강의가 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
