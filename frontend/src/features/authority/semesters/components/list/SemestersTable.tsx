"use client";

import { Table, type TableColumn } from "@/components/table";
import type { SemesterItem } from "@/features/authority/semesters/api/types";
import { statusToLabel, termToLabel } from "../../utils/semesterLabel";
import styles from "./SemestersTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status/StatusPill";
import { useI18n } from "@/i18n/useI18n";
import { useLocale } from "@/hooks/useLocale";

type Props = {
  items: SemesterItem[];
  loading: boolean;
  onEditClick: (id: string) => void;
};

export function SemestersTable({ items, loading, onEditClick }: Props) {
  const { locale } = useLocale();
  const t = useI18n("authority.semesters.table");

  const columns: Array<TableColumn<SemesterItem>> = [
    { header: t("year"), align: "center", render: (r) => r.year },
    { header: t("term"), align: "center", render: (r) => termToLabel(r.term, locale) },
    { header: t("period"), align: "center", render: (r) => r.period },
    {
      header: t("status"),
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.status as any}
          label={statusToLabel(r.status, locale)}
        />
      ),
    },
    {
      header: t("manage"),
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button variant="secondary" onClick={() => onEditClick(r.id)}>
            {t("editButton")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<SemesterItem>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.id}
      emptyText={t("emptyText")}
    />
  );
}
