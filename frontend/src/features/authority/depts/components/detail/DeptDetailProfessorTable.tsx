"use client";

import { Table, type TableColumn } from "@/components/table";
import { DeptProfessorListItemDto } from "../../api/types";

type Props = {
  items: DeptProfessorListItemDto[];
  loading: boolean;
  onEditClick?: (id: number) => void;
};

export function DeptDetailProfessorTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<DeptProfessorListItemDto>> = [
    { header: "교번", align: "center", render: (r) => r.proId },
    { header: "이름", align: "center", render: (r) => r.proName },
    { header: "이메일", align: "center", render: (r) => r.proEmail },
    { header: "전화번호", align: "center", render: (r) => r.proAdd },
  ];

  return (
    <Table<DeptProfessorListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.proId}
      emptyText="소속 교수가 없습니다."
    />
  );
}
