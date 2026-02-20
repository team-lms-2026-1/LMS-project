"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./GradeDetailTable.module.css"
import { StudentGradeDetailListDto } from "@/features/curricular-offering/api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: StudentGradeDetailListDto[];
  loading: boolean;
};

export function GradeDetailTable({ items, loading }: Props) {
  const t = useI18n("curricular.adminGrades.detail.table");

  const columns: Array<TableColumn<StudentGradeDetailListDto>> = [
    { header: t("curricularCode"), align: "center", render: (r) => r.curricularCode },
    { header: t("curricularName"), align: "center", render: (r) => r.curricularName },
    { header: t("credits"), align: "center", render: (r) => r.credits },
    { header: t("grade"), align: "center", render: (r) => r.grade },
  ];

  return (
    <Table<StudentGradeDetailListDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.enrollmentId}
      emptyText={t("emptyText")}
    />
  );
}
