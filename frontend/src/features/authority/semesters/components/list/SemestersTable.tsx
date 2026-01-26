"use client";

import { Table, type TableColumn } from "@/components/table";
import type { SemesterItem } from "@/features/authority/semesters/api/types";
import { termToLabel } from "../../utils/semesterLabel";
import styles from "./SemestersTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status/StatusPill";

type Props = {
  items: SemesterItem[];
  loading: boolean;
  onRowClick: (id: string) => void;
  onEditClick: (id: string) => void;
};

function mapSemesterStatus(status: SemesterItem["status"]): {
  pillStatus:
    | "PLANNED"
    | "DRAFT"
    | "OPEN"
    | "ENROLL_CLOSED"
    | "PROGRESS"
    | "COMPLETED"
    | "CLOSED"
    | "CANCELED";
  label: string;
} {
  const s = String(status);
  return { pillStatus: "DRAFT", label: s };
}

export function SemestersTable({ items, loading, onRowClick, onEditClick }: Props) {
  const columns: Array<TableColumn<SemesterItem>> = [
    { header: "연도", align: "center", render: (r) => r.year },
    { header: "학기", align: "center", render: (r) => termToLabel(r.term) },
    { header: "기간", align: "center", render: (r) => r.period },
    {
      header: "상태",
      align: "center",
      render: (r) => {
        const { pillStatus, label } = mapSemesterStatus(r.status);
        return <StatusPill status={pillStatus} label={label}/>;
      },
    },
    {
      header: "관리",
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button
            variant="secondary"
            onClick={() => onEditClick(r.id)}
          >
            수정
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
      onRowClick={(r) => onRowClick(r.id)}
      emptyText="학기가 없습니다."
    />
  );
}
