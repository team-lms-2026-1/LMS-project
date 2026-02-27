"use client";

import { Table, type TableColumn } from "@/components/table";
import { CurricularOfferingGradeListItemDto } from "../../api/types";
import styles from "./CurricularGradeTable.module.css"
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: CurricularOfferingGradeListItemDto[];
  loading: boolean;
//   onEditClick: (id: number) => void;
  onRowClick?: (row: CurricularOfferingGradeListItemDto) => void;
};

export function CurricularGradeTable({ items, loading, onRowClick }: Props) {
  const t = useI18n("curricular.adminGrades.table");
  const tCommon = useI18n("curricular.common");

  const columns: Array<TableColumn<CurricularOfferingGradeListItemDto>> = [
    { header: t("studentNo"), align: "center", render: (r) => r.studentNo },
    { header: t("deptName"), align: "center", render: (r) => r.deptName },
    { header: t("gradeLevel"), align: "center", render: (r) => r.gradeLevel },
    { header: t("name"), align: "center", render: (r) => r.name },
    { header: t("gpa"), align: "center", render: (r) => r.gpa },
    {
      header: tCommon("manageHeader"),
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick?.(r);
            }} 
          >
            {tCommon("detailButton")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<CurricularOfferingGradeListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.studentAccountId}
      emptyText={t("emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
