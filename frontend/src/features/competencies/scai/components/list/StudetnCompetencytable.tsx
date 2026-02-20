"use client";

import { Table, type TableColumn } from "@/components/table";
import type { StudentCompetencyListItemDto, StudentCompetencyTableProps } from "../../api/types";
import styles from "./StudetnCompetencytable.module.css";
import { useRouter } from "next/navigation";

export function StudetnCompetencytable({ items, loading }: StudentCompetencyTableProps) {
  const router = useRouter();
  const columns: Array<TableColumn<StudentCompetencyListItemDto>> = [
    {
      header: "학번",
      align: "center",
      cellClassName: styles.studentNumber,
      render: (r) => r.studentNumber,
    },
    {
      header: "학과",
      align: "center",
      cellClassName: styles.deptName,
      render: (r) => r.deptName,
    },
    { header: "학년", align: "center", render: (r) => r.grade },
    {
      header: "이름",
      align: "center",
      cellClassName: styles.name,
      render: (r) => r.name,
    },
  ];

  return (
    <Table<StudentCompetencyListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.accountId}
      emptyText="조회된 학생이 없습니다."
      onRowClick={(r) => router.push(`/admin/competencies/students/${r.accountId}`)}
    />
  );
}
