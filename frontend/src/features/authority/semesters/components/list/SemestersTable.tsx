"use client";

import { Table, type TableColumn } from "@/components/ui/table";
import type { SemesterItem } from "@/features/authority/semesters/api/types";
import { termToLabel } from "../../utils/semesterLabel";
import styles from "./SemestersTable.module.css"; // ✅ 필요(버튼/관리셀만 쓰면 됨)

type Props = {
  items: SemesterItem[];
  loading: boolean;
  onRowClick: (id: string) => void;
  onEditClick: (id: string) => void;
};

function StatusPill({ status }: { status: SemesterItem["status"] }) {
  // 일단 텍스트만. (원하면 다음에 공용 badge로 빼자)
  return <span>{status}</span>;
}

export function SemestersTable({
  items,
  loading,
  onRowClick,
  onEditClick,
}: Props) {
  const columns: Array<TableColumn<SemesterItem>> = [
    { header: "연도", align: "center", render: (r) => r.year },
    { header: "학기", align: "center", render: (r) => termToLabel(r.term) },
    { header: "기간", align: "center", render: (r) => r.period },
    {
      header: "상태",
      align: "center",
      render: (r) => <StatusPill status={r.status} />,
    },
    {
      header: "관리",
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => onEditClick(r.id)}
          >
            수정
          </button>
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
