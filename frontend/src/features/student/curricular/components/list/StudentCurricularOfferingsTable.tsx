
"use client";

import { Table, type TableColumn } from "@/components/table";
import { CurricularOfferingListItemDto } from "../../api/types";
import styles from "./StudentCurricularOfferingsTable.module.css"
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";

type Props = {
  items: CurricularOfferingListItemDto[];
  loading: boolean;
//   onEditClick: (id: number) => void;
  onRowClick?: (row: CurricularOfferingListItemDto) => void;
};

export function StudentCurricularOfferingsTable({ items, loading, onRowClick }: Props) {
  const columns: Array<TableColumn<CurricularOfferingListItemDto>> = [
    { header: "개설코드", align: "center", render: (r) => r.offeringCode },
    { header: "교과목명", align: "center", render: (r) => r.curricularName },
    { header: "담당교수", align: "center", render: (r) => r.professorName },
    { header: "학기", align: "center", render: (r) => r.semesterName },
    { header: "학점", align: "center", render: (r) => r.credit },
    { header: "주역량1", align: "center", render: (r) => r.competencyName1 ?? "-" },
    { header: "주역량2", align: "center", render: (r) => r.competencyName2 ?? "-" },
    { header: "수용인원수", align: "center", render: (r) => r.capacity },
    { header: "등록인원수", align: "center", render: (r) => r.enrolledCount },

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
    <Table<CurricularOfferingListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.offeringId}
      emptyText="교과운영이 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
