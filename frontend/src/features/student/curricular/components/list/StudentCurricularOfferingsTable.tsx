"use client";

import { Button } from "@/components/button";
import { Table, type TableColumn } from "@/components/table";
import { useI18n } from "@/i18n/useI18n";
import type { CurricularOfferingListItemDto } from "../../api/types";
import styles from "./StudentCurricularOfferingsTable.module.css";

type Props = {
  items: CurricularOfferingListItemDto[];
  loading: boolean;
  onRowClick?: (row: CurricularOfferingListItemDto) => void;
};

export function StudentCurricularOfferingsTable({ items, loading, onRowClick }: Props) {
  const t = useI18n("curricular.studentOfferings.table");
  const tCommon = useI18n("curricular.common");

  const columns: Array<TableColumn<CurricularOfferingListItemDto>> = [
    { header: t("offeringCode"), align: "center", render: (r) => r.offeringCode },
    { header: t("curricularName"), align: "center", render: (r) => r.curricularName },
    { header: t("professorName"), align: "center", render: (r) => r.professorName },
    { header: t("semesterName"), align: "center", render: (r) => r.semesterName },
    { header: t("credit"), align: "center", render: (r) => r.credit },
    { header: t("competency1"), align: "center", render: (r) => r.competencyName1 ?? "-" },
    { header: t("competency2"), align: "center", render: (r) => r.competencyName2 ?? "-" },
    { header: t("capacity"), align: "center", render: (r) => r.capacity },
    { header: t("enrolledCount"), align: "center", render: (r) => r.enrolledCount },
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
