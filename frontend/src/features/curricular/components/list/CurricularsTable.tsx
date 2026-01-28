"use client";

import { Table, type TableColumn } from "@/components/table";
import { CurricularListItemDto } from "../../api/types";
import styles from "./CurricularsTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";

type Props = {
  items: CurricularListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function CurricularsTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<CurricularListItemDto>> = [
    { header: "교과코드", align: "center", render: (r) => r.curricularCode },
    { header: "교과목명", align: "center", render: (r) => r.curricularName },
    { header: "주관학과", align: "center", render: (r) => r.deptName },
    { header: "학점", align: "center", render: (r) => r.credits },
    {
      header: "사용여부",
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.isActive ? "ACTIVE" : "INACTIVE"}
          label={r.isActive ? "활성" : "비활성"}  
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
          <Button variant="secondary" onClick={() => onEditClick(r.curricularId)}>
            수정
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<CurricularListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.curricularId}
      emptyText="교과가 없습니다."
    />
  );
}
