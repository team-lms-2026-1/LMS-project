"use client";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentCurrentEnrollmentsTable.module.css";
import type { CurricularEnrollmentListItemDto } from "../../api/types";

type Props = {
  items: CurricularEnrollmentListItemDto[];
  loading: boolean;
  onRowClick?: (row: CurricularEnrollmentListItemDto) => void;
};

export function StudentCurrentEnrollmentsTable({ items, loading, onRowClick }: Props) {
  const tEnrollments = useI18n("curricular.studentEnrollments");
  const tCurrent = useI18n("curricular.studentCurrentEnrollments");
  const tCommon = useI18n("curricular.common");

  const columns: Array<TableColumn<CurricularEnrollmentListItemDto>> = [
    { header: tEnrollments("table.offeringCode"), align: "center", render: (row) => row.offeringCode },
    { header: tEnrollments("table.curricularName"), align: "center", render: (row) => row.curricularName },
    { header: tEnrollments("table.professorName"), align: "center", render: (row) => row.professorName },
    { header: tEnrollments("table.semesterName"), align: "center", render: (row) => row.semesterName },
    { header: tEnrollments("table.credit"), align: "center", render: (row) => row.credit },
    { header: tEnrollments("table.competency1"), align: "center", render: (row) => row.competencyName1 ?? "-" },
    { header: tEnrollments("table.competency2"), align: "center", render: (row) => row.competencyName2 ?? "-" },
    { header: tEnrollments("table.capacity"), align: "center", render: (row) => row.capacity },
    { header: tEnrollments("table.enrolledCount"), align: "center", render: (row) => row.enrolledCount },
    {
      header: tCommon("manageHeader"),
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (row) => (
        <div className={styles.manageCell}>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick?.(row);
            }}
          >
            {tCommon("detailButton")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<CurricularEnrollmentListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(row) => row.offeringId}
      emptyText={tCurrent("table.emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
