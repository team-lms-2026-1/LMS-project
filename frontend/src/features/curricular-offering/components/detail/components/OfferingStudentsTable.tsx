"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./OfferingStudentsTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { enrollmentStatusLabel, completionStatusLabel } from "@/features/curricular-offering/utils/studentStatusLable";
import { CurricularOfferingStudentListItemDto } from "@/features/curricular-offering/api/types";

type Props = {
  items: CurricularOfferingStudentListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function OfferingStudentsTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<CurricularOfferingStudentListItemDto>> = [
    { header: "학생명", align: "center", render: (r) => r.studentName },
    { header: "학번", align: "center", render: (r) => r.studentNo },
    { header: "학년", align: "center", render: (r) => r.gradeLevel },
    { header: "소속학과", align: "center", render: (r) => r.deptName },
    { header: "점수", align: "center", render: (r) => r.rawScore },
    { header: "등급", align: "center", render: (r) => r.grade },
    { header: "수강상태", align: "center", render: (r) => (
    <StatusPill
        status={r.enrollmentStatus as any}
        label={enrollmentStatusLabel(r.enrollmentStatus)}
    />
    )},

    { header: "이수상태", align: "center", render: (r) => (
    <StatusPill
        status={r.completionStatus as any}
        label={completionStatusLabel(r.completionStatus)}
    />
    )},
    {
      header: "점수등록",
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button variant="secondary" onClick={() => onEditClick(r.enrollmentId)}>
            수정
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<CurricularOfferingStudentListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.enrollmentId}
      emptyText="이수학생이 없습니다."
    />
  );
}
