"use client";

import { Table, type TableColumn } from "@/components/table";
import { CurricularListItemDto } from "../../api/types";
import styles from "./CurricularsTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: CurricularListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function CurricularsTable({ items, loading, onEditClick }: Props) {
  const t = useI18n("curricular.adminCurriculars.table");
  const tStatus = useI18n("curricular.status.active");
  const tCommon = useI18n("curricular.common");

  const columns: Array<TableColumn<CurricularListItemDto>> = [
    { header: t("curricularCode"), align: "center", render: (r) => r.curricularCode },
    { header: t("curricularName"), align: "center", render: (r) => r.curricularName },
    { header: t("deptName"), align: "center", render: (r) => r.deptName },
    { header: t("credits"), align: "center", render: (r) => r.credits },
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
          <Button variant="secondary" onClick={() => onEditClick(r.curricularId)}>
            {tCommon("editButton")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<CurricularListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.curricularId}
      emptyText={t("emptyText")}
    />
  );
}
