"use client";

import { Table, type TableColumn } from "@/components/table";
import { useI18n } from "@/i18n/useI18n";
import { StudentGradeDetailListDto } from "@/features/curricular-offering/api/types";
import styles from "./GradeDetailMeTable.module.css";

type Props = {
  items: StudentGradeDetailListDto[];
  loading: boolean;
};

export function GradeDetailMeTable({ items, loading }: Props) {
  const t = useI18n("curricular.adminGrades.detail.table");

  const columns: Array<TableColumn<StudentGradeDetailListDto>> = [
    { header: t("curricularCode"), align: "center", render: (row) => row.curricularCode },
    { header: t("curricularName"), align: "center", render: (row) => row.curricularName },
    { header: t("credits"), align: "center", render: (row) => row.credits },
    { header: t("grade"), align: "center", render: (row) => row.grade },
  ];

  return (
    <Table<StudentGradeDetailListDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(row) => row.enrollmentId}
      emptyText={t("emptyText")}
    />
  );
}
