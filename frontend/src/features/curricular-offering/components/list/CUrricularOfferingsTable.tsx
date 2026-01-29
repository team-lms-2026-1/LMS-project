"use client";

import { Table, type TableColumn } from "@/components/table";
import { CurricularOfferingListItemDto } from "../../api/types";
import styles from "./CUrricularOfferingsTable.module.css"
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";

type Props = {
  items: CurricularOfferingListItemDto[];
  loading: boolean;
//   onEditClick: (id: number) => void;
};

export function CurricularOfferingsTable({ items, loading }: Props) {
  const columns: Array<TableColumn<CurricularOfferingListItemDto>> = [
    { header: "개설코드", align: "center", render: (r) => r.offeringCode },
    { header: "교과목명", align: "center", render: (r) => r.curricularName },
    { header: "인원수", align: "center", render: (r) => r.capacity },
    { header: "담당교수", align: "center", render: (r) => r.professorName },
    { header: "학기", align: "center", render: (r) => r.semesterName },
    { header: "장소", align: "center", render: (r) => r.location },
    { header: "학점", align: "center", render: (r) => r.credit },
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
          <Button variant="secondary" >
            수정
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<CurricularOfferingListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.offeringId}
      emptyText="교과운영이 없습니다."
    />
  );
}
