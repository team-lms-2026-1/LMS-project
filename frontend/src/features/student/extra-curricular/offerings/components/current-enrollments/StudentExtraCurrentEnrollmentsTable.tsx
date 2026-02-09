"use client";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import styles from "./StudentExtraCurrentEnrollmentsTable.module.css";

import type { ExtraCurricularEnrollmentListItemDto } from "../../api/types";

type Props = {
  items: ExtraCurricularEnrollmentListItemDto[];
  loading: boolean;
  onRowClick?: (row: ExtraCurricularEnrollmentListItemDto) => void;
};

export function StudentExtraCurrentEnrollmentsTable({
  items,
  loading,
  onRowClick,
}: Props) {
  const columns: Array<TableColumn<ExtraCurricularEnrollmentListItemDto>> = [
    { header: "비교과코드", align: "center", render: (r) => r.extraOfferingCode },
    { header: "비교과명", align: "center", render: (r) => r.extraOfferingName },
    { header: "담당자", align: "center", render: (r) => r.hostContactName },
    { header: "학기", align: "center", render: (r) => r.semesterName },
    { header: "상점", align: "center", render: (r) => r.rewardPointDefault },
    { header: "인정시간", align: "center", render: (r) => r.recognizedHoursDefault },
    {
      header: "관리",
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
            상세
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<ExtraCurricularEnrollmentListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.extraOfferingId}
      emptyText="이수중인 비교과가 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
