"use client";

import { Table, type TableColumn } from "@/components/table";

import styles from "./ExtraCurricularOfferingTable.module.css"
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { ExtraCurricularOfferingListItemDto } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: ExtraCurricularOfferingListItemDto[];
  loading: boolean;
//   onEditClick: (id: number) => void;
  onRowClick?: (row: ExtraCurricularOfferingListItemDto) => void;
};

export function ExtraCurricularOfferingTable({ items, loading, onRowClick }: Props) {
  const t = useI18n("extraCurricular.adminOfferings.table");
  const tStatus = useI18n("extraCurricular.status.offering");
  const tCommon = useI18n("extraCurricular.common");

  const offeringStatusLabel = (value: string) => {
    switch (value) {
      case "DRAFT":
        return tStatus("DRAFT");
      case "OPEN":
        return tStatus("OPEN");
      case "ENROLLMENT_CLOSED":
        return tStatus("ENROLLMENT_CLOSED");
      case "IN_PROGRESS":
        return tStatus("IN_PROGRESS");
      case "COMPLETED":
        return tStatus("COMPLETED");
      case "CANCELED":
        return tStatus("CANCELED");
      default:
        return value;
    }
  };

  const columns: Array<TableColumn<ExtraCurricularOfferingListItemDto>> = [
    { header: t("offeringCode"), align: "center", render: (r) => r.extraOfferingCode },
    { header: t("offeringName"), align: "center", render: (r) => r.extraOfferingName },
    { header: t("hostContactName"), align: "center", render: (r) => r.hostContactName },
    { header: t("rewardPoint"), align: "center", render: (r) => r.rewardPointDefault },
    { header: t("recognizedHours"), align: "center", render: (r) => r.recognizedHoursDefault },
    {
      header: t("status"),
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.status as any}
          label={offeringStatusLabel(r.status)}
        />
      ),
    },
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
    <Table<ExtraCurricularOfferingListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.extraOfferingId}
      emptyText={t("emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
