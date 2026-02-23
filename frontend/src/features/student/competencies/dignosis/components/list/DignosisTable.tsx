"use client";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { StatusPill, type StatusType } from "@/components/status";
import type { DiagnosisListItemDto, DiagnosisStatus, DiagnosisTableProps } from "../../api/types";
import styles from "./DignosisTable.module.css";

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatPeriod(start?: string, end?: string) {
  return `${formatDate(start)}~${formatDate(end)}`;
}

function formatNumber(id: number) {
  return String(id);
}

function getDisplayNumber(item: DiagnosisListItemDto, index: number) {
  const value = Number(item.displayNo);
  if (Number.isFinite(value) && value > 0) return value;
  return index + 1;
}

const STATUS_MAP: Record<string, { label: string; pill: StatusType }> = {
  PENDING: { label: "미응답", pill: "PENDING" },
  SUBMITTED: { label: "응답완료", pill: "COMPLETED" },
};

function getStatusConfig(status?: DiagnosisStatus) {
  if (!status) return { label: "-", pill: "PENDING" as StatusType };
  return STATUS_MAP[status] ?? { label: status, pill: "PENDING" as StatusType };
}

export function DignosisTable({ items, loading, onRowClick }: DiagnosisTableProps) {
  const columns: Array<TableColumn<DiagnosisListItemDto>> = [
    {
      header: "번호",
      align: "center",
      cellClassName: styles.numberCell,
      render: (r, index) => formatNumber(getDisplayNumber(r, index)),
    },
    {
      header: "제목",
      align: "center",
      cellClassName: styles.titleCell,
      render: (r) => r.title,
    },
    {
      header: "학기",
      align: "center",
      cellClassName: styles.targetCell,
      render: (r) => r.semesterName ?? "-",
    },
    {
      header: "진단기간",
      align: "center",
      cellClassName: styles.periodCell,
      render: (r) => formatPeriod(r.startedAt, r.endedAt),
    },
    {
      header: "상태",
      align: "center",
      cellClassName: styles.statusCell,
      render: (r) => {
        const { label, pill } = getStatusConfig(r.status);
        return <StatusPill status={pill} label={label} />;
      },
    },
    {
      header: "관리",
      width: 160,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button
            variant={r.status === "PENDING" ? "primary" : "secondary"}
            onClick={(e) => {
              e.stopPropagation();
              onRowClick?.(r);
            }}
          >
            {r.status === "PENDING" ? "응답" : "상세"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<DiagnosisListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.diagnosisId}
      emptyText="조회된 진단서가 없습니다."
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
