"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./ExtraCurricularMasterTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { ExtraCurricularListItemDto } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: ExtraCurricularListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function ExtraCurricularMasterTable({ items, loading, onEditClick }: Props) {
  const t = useI18n("extraCurricular.adminPrograms.table");
  const tStatus = useI18n("extraCurricular.status.active");
  const tCommon = useI18n("extraCurricular.common");

  const columns: Array<TableColumn<ExtraCurricularListItemDto>> = [
    { header: t("programCode"), align: "center", render: (r) => r.extraCurricularCode },
    { header: t("programName"), align: "center", render: (r) => r.extraCurricularName },
    { header: t("hostOrgName"), align: "center", render: (r) => r.hostOrgName },
    {
      header: t("status"),
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.isActive ? "ACTIVE" : "INACTIVE"}
          label={r.isActive ? tStatus("ACTIVE") : tStatus("INACTIVE")}
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
          <Button variant="secondary" onClick={() => onEditClick(r.extraCurricularId)}>
            {tCommon("editButton")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<ExtraCurricularListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.extraCurricularId}
      emptyText={t("emptyText")}
    />
  );
}
