"use client";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import styles from "./StudentExtraEnrollmentsTable.module.css";

import type { ExtraCurricularEnrollmentListItemDto } from "../../api/types";
import { extraOfferingStatusLabel } from "../../utils/extraStatusLabel";

type Props = {
  items: ExtraCurricularEnrollmentListItemDto[];
  loading: boolean;
  onCancelClick: (row: ExtraCurricularEnrollmentListItemDto) => void;
  onRowClick?: (row: ExtraCurricularEnrollmentListItemDto) => void;
  isCancelDisabled?: (row: ExtraCurricularEnrollmentListItemDto) => boolean;
};

export function StudentExtraCurricularEnrollmentsTable({
  items,
  loading,
  onCancelClick,
  onRowClick,
  isCancelDisabled,
}: Props) {
  const columns: Array<TableColumn<ExtraCurricularEnrollmentListItemDto>> = [
    { header: "비교과코드", align: "center", render: (r) => r.extraOfferingCode },
    { header: "비교과명", align: "center", render: (r) => r.extraOfferingName },
    { header: "담당자", align: "center", render: (r) => r.hostContactName },
    { header: "학기", align: "center", render: (r) => r.semesterName },
    { header: "상점", align: "center", render: (r) => r.rewardPointDefault },
    { header: "인정시간", align: "center", render: (r) => r.recognizedHoursDefault },
    {
      header: "상태",
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.status as any}
          label={extraOfferingStatusLabel(r.status)}
        />
      ),
    },
    {
      header: "관리",
      width: 160,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button
            variant="danger"
            disabled={isCancelDisabled ? isCancelDisabled(r) : false}
            onClick={(e) => {
              e.stopPropagation();
              onCancelClick(r);
            }}
          >
            신청취소
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
      emptyText="신청중인 비교과가 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
