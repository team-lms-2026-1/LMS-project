"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./GradeDetailMeTable.module.css"
import { StudentGradeDetailListDto } from "@/features/curricular-offering/api/types";

type Props = {
  items: StudentGradeDetailListDto[];
  loading: boolean;
};

export function GradeDetailMeTable({ items, loading }: Props) {
  const columns: Array<TableColumn<StudentGradeDetailListDto>> = [
    { header: "교과코드", align: "center", render: (r) => r.curricularCode },
    { header: "교과이름", align: "center", render: (r) => r.curricularName },
    { header: "학점", align: "center", render: (r) => r.credits },
    { header: "등급", align: "center", render: (r) => r.grade },
  ];

  return (
    <Table<StudentGradeDetailListDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.enrollmentId}
      emptyText="성적 정보가 없습니다."
    />
  );
}
