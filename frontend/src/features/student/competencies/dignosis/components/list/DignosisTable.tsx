"use client";

import { useI18n } from "@/i18n/useI18n";
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

export function DignosisTable({ items, loading, onRowClick }: DiagnosisTableProps) {
  const t = useI18n("competency.studentDiagnosis.list.table");

  const getStatusConfig = (status?: DiagnosisStatus): { label: string; pill: StatusType } => {
    const normalized = String(status ?? "").trim().toUpperCase();
    if (normalized === "PENDING") return { label: t("statusLabel.PENDING"), pill: "PENDING" };
    if (normalized === "SUBMITTED") return { label: t("statusLabel.SUBMITTED"), pill: "COMPLETED" };
    return { label: status ?? "-", pill: "PENDING" };
  };

  const columns: Array<TableColumn<DiagnosisListItemDto>> = [
    {
      header: t("headers.number"),
      align: "center",
      cellClassName: styles.numberCell,
      render: (r, index) => formatNumber(getDisplayNumber(r, index)),
    },
    {
      header: t("headers.title"),
      align: "center",
      cellClassName: styles.titleCell,
      render: (r) => r.title,
    },
    {
      header: t("headers.semester"),
      align: "center",
      cellClassName: styles.targetCell,
      render: (r) => r.semesterName ?? "-",
    },
    {
      header: t("headers.period"),
      align: "center",
      cellClassName: styles.periodCell,
      render: (r) => formatPeriod(r.startedAt, r.endedAt),
    },
    {
      header: t("headers.status"),
      align: "center",
      cellClassName: styles.statusCell,
      render: (r) => {
        const { label, pill } = getStatusConfig(r.status);
        return <StatusPill status={pill} label={label} />;
      },
    },
    {
      header: t("headers.manage"),
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
            {r.status === "PENDING" ? t("buttons.respond") : t("buttons.detail")}
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
      emptyText={t("emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}
