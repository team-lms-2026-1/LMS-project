"use client";

import { Table, type TableColumn } from "@/components/table";
import { CurricularOfferingGradeListItemDto, CurricularOfferingListItemDto } from "../../api/types";
import styles from "./CurricularGradeTable.module.css"
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";

type Props = {
  items: CurricularOfferingGradeListItemDto[];
  loading: boolean;
//   onEditClick: (id: number) => void;
  onRowClick?: (row: CurricularOfferingGradeListItemDto) => void;
};

export function CurricularGradeTable({ items, loading, onRowClick }: Props) {
  const columns: Array<TableColumn<CurricularOfferingGradeListItemDto>> = [
    { header: "학번", align: "center", render: (r) => r.studentNo },
    { header: "소속학과", align: "center", render: (r) => r.deptName },
    { header: "학년", align: "center", render: (r) => r.gradeLevel },
    { header: "이름", align: "center", render: (r) => r.name },
    { header: "GPA", align: "center", render: (r) => r.gpa },
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
    <Table<CurricularOfferingGradeListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.studentAccountId}
      emptyText="교과운영이 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
