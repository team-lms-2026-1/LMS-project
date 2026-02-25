"use client";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentExtraEnrollmentsTable.module.css";
import type { ExtraCurricularEnrollmentListItemDto } from "../../api/types";

type Props = {
  items: ExtraCurricularEnrollmentListItemDto[];
  loading: boolean;
  onCancelClick: (row: ExtraCurricularEnrollmentListItemDto) => void;
  onRowClick?: (row: ExtraCurricularEnrollmentListItemDto) => void;
  isCancelDisabled?: (row: ExtraCurricularEnrollmentListItemDto) => boolean;
};

export function StudentExtraCurricularEnrollmentsTable({
  items,
  loading,
  onCancelClick,
  onRowClick,
  isCancelDisabled,
}: Props) {
  const t = useI18n("extraCurricular.studentEnrollments");
  const tCommon = useI18n("extraCurricular.common");
  const tStatus = useI18n("extraCurricular.status.offering");

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT":
      case "OPEN":
      case "ENROLLMENT_CLOSED":
      case "IN_PROGRESS":
      case "COMPLETED":
      case "CANCELED":
        return tStatus(status);
      default:
        return status;
    }
  };

  const columns: Array<TableColumn<ExtraCurricularEnrollmentListItemDto>> = [
    { header: t("table.offeringCode"), align: "center", render: (row) => row.extraOfferingCode },
    { header: t("table.offeringName"), align: "center", render: (row) => row.extraOfferingName },
    { header: t("table.hostContactName"), align: "center", render: (row) => row.hostContactName },
    { header: t("table.semesterName"), align: "center", render: (row) => row.semesterName },
    { header: t("table.rewardPoint"), align: "center", render: (row) => row.rewardPointDefault },
    { header: t("table.recognizedHours"), align: "center", render: (row) => row.recognizedHoursDefault },
    {
      header: t("table.status"),
      align: "center",
      render: (row) => <StatusPill status={row.status as any} label={getStatusLabel(row.status)} />,
    },
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
    <Table<ExtraCurricularEnrollmentListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(row) => row.extraOfferingId}
      emptyText={t("table.emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
