"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";
import { Table, type TableColumn } from "@/components/table";
import type { StudentCompetencyListItemDto, StudentCompetencyTableProps } from "../../api/types";
import styles from "./StudetnCompetencytable.module.css";

export function StudetnCompetencytable({ items, loading }: StudentCompetencyTableProps) {
  const t = useI18n("competency.adminStudents.table");
  const router = useRouter();

  const columns: Array<TableColumn<StudentCompetencyListItemDto>> = [
    {
      header: t("headers.studentNumber"),
      align: "center",
      cellClassName: styles.studentNumber,
      render: (r) => r.studentNumber,
    },
    {
      header: t("headers.deptName"),
      align: "center",
      cellClassName: styles.deptName,
      render: (r) => r.deptName,
    },
    { header: t("headers.grade"), align: "center", render: (r) => r.grade },
    {
      header: t("headers.name"),
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
      emptyText={t("emptyText")}
      onRowClick={(r) => router.push(`/admin/competencies/students/${r.accountId}`)}
    />
  );
}
