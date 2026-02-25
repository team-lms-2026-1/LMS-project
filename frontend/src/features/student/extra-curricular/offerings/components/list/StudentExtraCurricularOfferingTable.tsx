"use client";

import { Button } from "@/components/button";
import { Table, type TableColumn } from "@/components/table";
import { useI18n } from "@/i18n/useI18n";
import type { ExtraCurricularOfferingUserListItemDto } from "../../api/types";
import styles from "./StudentExtraCurricularOfferingTable.module.css";

type Props = {
  items: ExtraCurricularOfferingUserListItemDto[];
  loading: boolean;
  onRowClick?: (row: ExtraCurricularOfferingUserListItemDto) => void;
};

export function StudentExtraCurricularOfferingsTable({ items, loading, onRowClick }: Props) {
  const t = useI18n("extraCurricular.studentOfferings.table");
  const tCommon = useI18n("extraCurricular.common");

  const columns: Array<TableColumn<ExtraCurricularOfferingUserListItemDto>> = [
    { header: t("offeringCode"), align: "center", render: (r) => r.extraOfferingCode },
    { header: t("offeringName"), align: "center", render: (r) => r.extraOfferingName },
    { header: t("hostContactName"), align: "center", render: (r) => r.hostContactName },
    { header: t("rewardPoint"), align: "center", render: (r) => r.rewardPointDefault },
    { header: t("recognizedHours"), align: "center", render: (r) => r.recognizedHoursDefault },
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
    <Table<ExtraCurricularOfferingUserListItemDto>
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
