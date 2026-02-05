"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./ExtraCurricularMasterTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { ExtraCurricularListItemDto } from "../../api/types";

type Props = {
  items: ExtraCurricularListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function ExtraCurricularMasterTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<ExtraCurricularListItemDto>> = [
    { header: "비교과코드", align: "center", render: (r) => r.extraCurricularCode },
    { header: "비교과목명", align: "center", render: (r) => r.extraCurricularName },
    { header: "주관기관", align: "center", render: (r) => r.hostOrgName },
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
          <Button variant="secondary" onClick={() => onEditClick(r.extraCurricularId)}>
            수정
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<ExtraCurricularListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.extraCurricularId}
      emptyText="비교과가 없습니다."
    />
  );
}
