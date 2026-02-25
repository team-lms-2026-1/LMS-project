"use client";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentEnrollmentsTable.module.css";
import type { CurricularEnrollmentListItemDto } from "../../api/types";

type Props = {
  items: CurricularEnrollmentListItemDto[];
  loading: boolean;
  onCancelClick: (row: CurricularEnrollmentListItemDto) => void;
  onRowClick?: (row: CurricularEnrollmentListItemDto) => void;
  isCancelDisabled?: (row: CurricularEnrollmentListItemDto) => boolean;
};

export function StudentCurricularEnrollmentsTable({
  items,
  loading,
  onCancelClick,
  onRowClick,
  isCancelDisabled,
}: Props) {
  const t = useI18n("curricular.studentEnrollments");
  const tCommon = useI18n("curricular.common");

  const columns: Array<TableColumn<CurricularEnrollmentListItemDto>> = [
    { header: t("table.offeringCode"), align: "center", render: (row) => row.offeringCode },
    { header: t("table.curricularName"), align: "center", render: (row) => row.curricularName },
    { header: t("table.professorName"), align: "center", render: (row) => row.professorName },
    { header: t("table.semesterName"), align: "center", render: (row) => row.semesterName },
    { header: t("table.credit"), align: "center", render: (row) => row.credit },
    { header: t("table.competency1"), align: "center", render: (row) => row.competencyName1 ?? "-" },
    { header: t("table.competency2"), align: "center", render: (row) => row.competencyName2 ?? "-" },
    { header: t("table.capacity"), align: "center", render: (row) => row.capacity },
    { header: t("table.enrolledCount"), align: "center", render: (row) => row.enrolledCount },
    {
      header: tCommon("manageHeader"),
      width: 160,
      align: "center",
      stopRowClick: true,
      render: (row) => (
        <div className={styles.manageCell}>
          <Button
            variant="danger"
            disabled={isCancelDisabled ? isCancelDisabled(row) : false}
            onClick={(e) => {
              e.stopPropagation();
              onCancelClick(row);
            }}
          >
            {t("table.cancelButton")}
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
      emptyText={t("table.emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
