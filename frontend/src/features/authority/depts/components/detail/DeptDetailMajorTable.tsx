"use client";

import { Table, type TableColumn } from "@/components/table";
import { DeptMajorListItemDto, DeptProfessorListItemDto, DeptStudentListItemDto } from "../../api/types";
import styles from "./DeptDetailTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";

type Props = {
  items: DeptMajorListItemDto[];
  loading: boolean;
  onEditClick?: (id: number) => void;
};

export function DeptDetailMajorTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<DeptMajorListItemDto>> = [
    { header: "전공명", align: "center", render: (r) => r.majName },
    { header: "재학생 수", align: "center", render: (r) => r.majCount },
  ];

  return (
    <Table<DeptMajorListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.majName}
      emptyText="전공이 없습니다."
    />
  );
}
