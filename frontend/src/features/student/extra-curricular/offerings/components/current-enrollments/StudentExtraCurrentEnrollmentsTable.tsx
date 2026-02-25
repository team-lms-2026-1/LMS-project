"use client";

import { Button } from "@/components/button";
import { Table, type TableColumn } from "@/components/table";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentExtraCurrentEnrollmentsTable.module.css";
import type { ExtraCurricularEnrollmentListItemDto } from "../../api/types";

type Props = {
  items: ExtraCurricularEnrollmentListItemDto[];
  loading: boolean;
  onRowClick?: (row: ExtraCurricularEnrollmentListItemDto) => void;
};

export function StudentExtraCurrentEnrollmentsTable({ items, loading, onRowClick }: Props) {
  const tEnrollments = useI18n("extraCurricular.studentEnrollments");
  const tCurrent = useI18n("extraCurricular.studentCurrentEnrollments");
  const tCommon = useI18n("extraCurricular.common");

  const columns: Array<TableColumn<ExtraCurricularEnrollmentListItemDto>> = [
    { header: tEnrollments("table.offeringCode"), align: "center", render: (r) => r.extraOfferingCode },
    { header: tEnrollments("table.offeringName"), align: "center", render: (r) => r.extraOfferingName },
    { header: tEnrollments("table.hostContactName"), align: "center", render: (r) => r.hostContactName },
    { header: tEnrollments("table.semesterName"), align: "center", render: (r) => r.semesterName },
    { header: tEnrollments("table.rewardPoint"), align: "center", render: (r) => r.rewardPointDefault },
    { header: tEnrollments("table.recognizedHours"), align: "center", render: (r) => r.recognizedHoursDefault },
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
    <Table<ExtraCurricularEnrollmentListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.extraOfferingId}
      emptyText={tCurrent("table.emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
