"use client";

import { Table, type TableColumn } from "@/components/table";
import { StatusPill } from "@/components/status";
import styles from "./ExtraCompletionDetailTable.module.css";

import type { ExtraCompletionListItemDto } from "../../../../api/types";
import { extraCompletionStatusLabel } from "../../../../utils/extraStatusLabel";

type Props = {
  items: ExtraCompletionListItemDto[];
  loading: boolean;
};

export function ExtraCompletionDetailTable({ items, loading }: Props) {
  const columns: Array<TableColumn<ExtraCompletionListItemDto>> = [
    { header: "학기", align: "center", render: (r) => r.semesterName },
    { header: "비교과코드", align: "center", render: (r) => r.extraOfferingCode },
    { header: "비교과명", align: "center", render: (r) => r.extraOfferingName },
    { header: "포인트", align: "center", render: (r) => r.rewardPointDefault },
    { header: "인정시간", align: "center", render: (r) => r.recognizedHoursDefault },
    {
      header: "수료여부",
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.completionStatus as any}
          label={extraCompletionStatusLabel(r.completionStatus)}
        />
      ),
    },
  ];

  return (
    <Table<ExtraCompletionListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.applicationId}
      emptyText="비교과 성적 정보가 없습니다."
    />
  );
}
