"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./ExtraCurricularGradeTable.module.css";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

import type { ExtraCurricularGradeListItemDto } from "../../api/types";

type Props = {
  items: ExtraCurricularGradeListItemDto[];
  loading: boolean;
  onRowClick?: (row: ExtraCurricularGradeListItemDto) => void;
};

export function ExtraCurricularGradeTable({ items, loading, onRowClick }: Props) {
  const t = useI18n("extraCurricular.adminGrades.table");
  const tCommon = useI18n("extraCurricular.common");

  const columns: Array<TableColumn<ExtraCurricularGradeListItemDto>> = [
    { header: t("studentNo"), align: "center", render: (r) => r.studentNo },
    { header: t("deptName"), align: "center", render: (r) => r.deptName },
    { header: t("gradeLevel"), align: "center", render: (r) => r.gradeLevel },
    { header: t("name"), align: "center", render: (r) => r.name },
    { header: t("totalEarnedPoints"), align: "center", render: (r) => r.totalEarnedPoints },
    { header: t("totalEarnedHours"), align: "center", render: (r) => r.totalEarnedHours },
    {
      header: tCommon("manageHeader"),
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button
            variant="secondary"
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
    <Table<ExtraCurricularGradeListItemDto>
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
