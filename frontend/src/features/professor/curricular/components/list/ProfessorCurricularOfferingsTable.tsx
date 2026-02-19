"use client";

import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { Table, type TableColumn } from "@/components/table";
import { useI18n } from "@/i18n/useI18n";

import type { CurricularOfferingListItemDto } from "../../api/types";
import styles from "./ProfessorCurricularOfferingsTable.module.css";

type Props = {
  items: CurricularOfferingListItemDto[];
  loading: boolean;
  onRowClick?: (row: CurricularOfferingListItemDto) => void;
};

export function ProfessorCurricularOfferingsTable({ items, loading, onRowClick }: Props) {
  const t = useI18n("curricular.professorOfferings.table");
  const tStatus = useI18n("curricular.status.offering");
  const tCommon = useI18n("curricular.common");

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

  const columns: Array<TableColumn<CurricularOfferingListItemDto>> = [
    { header: t("offeringCode"), align: "center", render: (r) => r.offeringCode },
    { header: t("curricularName"), align: "center", render: (r) => r.curricularName },
    { header: t("capacity"), align: "center", render: (r) => r.capacity },
    { header: t("professorName"), align: "center", render: (r) => r.professorName },
    { header: t("semesterName"), align: "center", render: (r) => r.semesterName },
    { header: t("location"), align: "center", render: (r) => r.location },
    { header: t("credit"), align: "center", render: (r) => r.credit },
    {
      header: t("status"),
      align: "center",
      render: (r) => (
        <StatusPill status={r.status as any} label={offeringStatusLabel(r.status)} />
      ),
    },
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
    <Table<CurricularOfferingListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.offeringId}
      emptyText={t("emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
