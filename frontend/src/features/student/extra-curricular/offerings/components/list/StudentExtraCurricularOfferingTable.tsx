
"use client";

import { Table, type TableColumn } from "@/components/table";

import styles from "./StudentExtraCurricularOfferingTable.module.css"
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { ExtraCurricularOfferingUserListItemDto } from "../../api/types";

type Props = {
  items: ExtraCurricularOfferingUserListItemDto[];
  loading: boolean;
//   onEditClick: (id: number) => void;
  onRowClick?: (row: ExtraCurricularOfferingUserListItemDto) => void;
};

export function StudentExtraCurricularOfferingsTable({ items, loading, onRowClick }: Props) {
  const columns: Array<TableColumn<ExtraCurricularOfferingUserListItemDto>> = [
    { header: "개설코드", align: "center", render: (r) => r.extraOfferingCode },
    { header: "비교과목명", align: "center", render: (r) => r.extraOfferingName },
    { header: "주관기관", align: "center", render: (r) => r.hostContactName },
    { header: "포인트", align: "center", render: (r) => r.rewardPointDefault },
    { header: "인정시간", align: "center", render: (r) => r.recognizedHoursDefault },

    {
      header: "관리",
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button variant="secondary"
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
    <Table<ExtraCurricularOfferingUserListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.extraOfferingId}
      emptyText="비교과운영이 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
