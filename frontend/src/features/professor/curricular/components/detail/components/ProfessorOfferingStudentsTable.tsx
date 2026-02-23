"use client";

import { StatusPill } from "@/components/status";
import { Table, type TableColumn } from "@/components/table";

import type { CurricularOfferingStudentListItemDto } from "../../../api/types";
import { completionStatusLabel, enrollmentStatusLabel } from "../../../utils/statusLabel";
import styles from "./ProfessorOfferingStudentsTable.module.css";

type Props = {
  items: CurricularOfferingStudentListItemDto[];
  loading: boolean;
};

export function ProfessorOfferingStudentsTable({ items, loading }: Props) {
  const columns: Array<TableColumn<CurricularOfferingStudentListItemDto>> = [
    { header: "학생명", align: "center", render: (r) => r.studentName },
    { header: "학번", align: "center", render: (r) => r.studentNo },
    { header: "학년", align: "center", render: (r) => r.gradeLevel },
    { header: "소속학과", align: "center", render: (r) => r.deptName },
    { header: "점수", align: "center", render: (r) => r.rawScore ?? "-" },
    { header: "등급", align: "center", render: (r) => r.grade ?? "-" },
    {
      header: "수강상태",
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.enrollmentStatus as any}
          label={enrollmentStatusLabel(r.enrollmentStatus)}
        />
      ),
    },
    {
      header: "이수상태",
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.completionStatus as any}
          label={completionStatusLabel(r.completionStatus)}
        />
      ),
    },
    {
      header: "점수등록",
      width: 120,
      align: "center",
      render: () => <span className={styles.readOnlyText}>조회 전용</span>,
    },
  ];

  return (
    <Table<CurricularOfferingStudentListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.enrollmentId}
      emptyText="수강학생이 없습니다."
    />
  );
}
