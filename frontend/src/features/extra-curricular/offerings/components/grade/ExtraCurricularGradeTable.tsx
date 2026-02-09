"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./ExtraCurricularGradeTable.module.css";
import { Button } from "@/components/button";

import type { ExtraCurricularGradeListItemDto } from "../../api/types";

type Props = {
  items: ExtraCurricularGradeListItemDto[];
  loading: boolean;
  onRowClick?: (row: ExtraCurricularGradeListItemDto) => void;
};

export function ExtraCurricularGradeTable({ items, loading, onRowClick }: Props) {
  const columns: Array<TableColumn<ExtraCurricularGradeListItemDto>> = [
    { header: "학번", align: "center", render: (r) => r.studentNo },
    { header: "소속학과", align: "center", render: (r) => r.deptName },
    { header: "학년", align: "center", render: (r) => r.gradeLevel },
    { header: "이름", align: "center", render: (r) => r.name },
    { header: "총 이수 포인트", align: "center", render: (r) => r.totalEarnedPoints },
    { header: "총 이수 시간", align: "center", render: (r) => r.totalEarnedHours },
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
    <Table<ExtraCurricularGradeListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.studentAccountId}
      emptyText="비교과 성적 정보가 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
