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
  onEditClick: (id: string) => void;
};

export function SemestersTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<SemesterItem>> = [
    { header: "연도", align: "center", render: (r) => r.year },
    { header: "학기", align: "center", render: (r) => termToLabel(r.term) },
    { header: "기간", align: "center", render: (r) => r.period },
    {
      header: "상태",
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.status as any}   // ⬅️ StatusPill 타입이 과하게 넓어서 충돌나면 이 한 줄로 해결
          label={r.status}           // ⬅️ 영어 그대로 표시
        />
      ),
    },
    {
      header: "관리",
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button variant="secondary" onClick={() => onEditClick(r.id)}>
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
      emptyText="학기가 없습니다."
    />
  );
}
