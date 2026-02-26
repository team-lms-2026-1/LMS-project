"use client";

import { Table, type TableColumn } from "@/components/table";
import { useI18n } from "@/i18n/useI18n";
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
  const t = useI18n("competency.adminDiagnosis.nonRespondentModal.table");
  const columns: Array<TableColumn<DiagnosisNonRespondentItem>> = [
    {
      header: t("headers.no"),
      width: 70,
      align: "center",
      render: (_row, idx) => startIndex + idx + 1,
    },
    {
      header: t("headers.studentNumber"),
      align: "center",
      render: (row) => row.studentNumber ?? "-",
    },
    {
      header: t("headers.name"),
      align: "center",
      render: (row) => row.name ?? "-",
    },
  ];

  return (
    <Table<DiagnosisNonRespondentItem>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(row, idx) => row.id ?? `${startIndex + idx}`}
      emptyText={t("emptyText")}
    />
  );
}
