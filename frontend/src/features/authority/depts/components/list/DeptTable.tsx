"use client";

import { Table, type TableColumn } from "@/components/table";
import { DeptListItemDto } from "../../api/types";
import styles from "./DeptTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";

type Props = {
  items: DeptListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function CurricularsTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<DeptListItemDto>> = [
    { header: "학과코드", align: "center", render: (r) => r.deptId },
    { header: "학과명", align: "center", render: (r) => r.deptCode },
    { header: "담당교수", align: "center", render: (r) => r.deptName },
    { header: "재학생수", align: "center", render: (r) => r.studentCount },
    { header: "교수 수", align: "center", render: (r) => r.professorCount },
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
          <Button variant="secondary" onClick={() => onEditClick(r.deptId)}>
            수정
          </Button>
        </div>
      ),
    },
  ];
  return (
      <Table<DeptListItemDto>
        columns={columns}
        items={items}
        loading={loading}
        skeletonRowCount={10}
        rowKey={(r) => r.deptId}
        emptyText="교과가 없습니다."
      />
    );
  }
  