"use client";

import { Table, type TableColumn } from "@/components/table";
import type {
  DiagnosisNonRespondentItem,
  NonRespondentTableProps,
} from "@/features/competencies/diagnosis/api/types";
import styles from "./NonRespondentTable.module.css";

export function NonRespondentTable({
  items,
  loading = false,
  startIndex = 0,
}: NonRespondentTableProps) {
  const columns: Array<TableColumn<DiagnosisNonRespondentItem>> = [
    {
      header: "NO",
      width: 70,
      align: "center",
      render: (_row, idx) => startIndex + idx + 1,
    },
    {
      header: "학번",
      align: "center",
      render: (row) => row.studentNumber ?? "-",
    },
    {
      header: "이름",
      align: "center",
      render: (row) => row.name ?? "-",
    },
    {
      header: "이메일",
      align: "center",
      cellClassName: styles.emailCell,
      render: (row) => row.email ?? "-",
    },
  ];

  return (
    <Table<DiagnosisNonRespondentItem>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(row, idx) => row.id ?? `${startIndex + idx}`}
      emptyText="미실시 학생이 없습니다."
    />
  );
}
