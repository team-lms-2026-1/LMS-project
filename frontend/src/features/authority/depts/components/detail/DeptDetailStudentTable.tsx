"use client";

import { Table, type TableColumn } from "@/components/table";
import { DeptProfessorListItemDto, DeptStudentListItemDto } from "../../api/types";


type Props = {
  items: DeptStudentListItemDto[];
  loading: boolean;
  onEditClick?: (id: number) => void;
};

export function DeptDetailStudentTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<DeptStudentListItemDto>> = [
    { header: "교번", align: "center", render: (r) => r.stuId },
    { header: "이름", align: "center", render: (r) => r.stuName },
    { header: "이메일", align: "center", render: (r) => r.stuClass },
    { header: "재학상태", align: "center", render: (r) => r.stuStatus },
    { header: "전공명", align: "center", render: (r) => r.stuMajor },
  ];

  return (
    <Table<DeptStudentListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.stuId}
      emptyText="소속 학생이 없습니다."
    />
  );
}
