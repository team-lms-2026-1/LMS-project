"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import type { DiagnosisListItemDto, DiagnosisStatus, DiagnosisTableProps } from "../../api/types";
import styles from "./DiagnosisTable.module.css";

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

function canEdit(status: DiagnosisStatus) {
  return status === "DRAFT" || status === "OPEN";
}

function canDelete(status: DiagnosisStatus) {
  return status === "DRAFT";
}

function isClosedStatus(status: DiagnosisStatus) {
  return String(status).toUpperCase() === "CLOSED";
}

export function DiagnosisTable({ items, loading, onEdit, onDelete }: DiagnosisTableProps) {
  const t = useI18n("competency.adminDiagnosis.list");
  const router = useRouter();

  const getStatusLabel = (status: DiagnosisStatus) => {
    const normalized = String(status ?? "").trim().toUpperCase();
    if (normalized === "DRAFT") return t("table.statusLabel.DRAFT");
    if (normalized === "OPEN") return t("table.statusLabel.OPEN");
    if (normalized === "CLOSED") return t("table.statusLabel.CLOSED");
    if (normalized === "PENDING") return t("table.statusLabel.PENDING");
    if (normalized === "SUBMITTED") return t("table.statusLabel.SUBMITTED");
    return status;
  };

  const formatDeptGrade = (deptName?: string, targetGrade?: string) => {
    const deptValue = String(deptName ?? "").trim();
    const gradeValue = String(targetGrade ?? "").trim();

    const dept = !deptValue || deptValue.toUpperCase() === "ALL" ? t("table.target.all") : deptValue;
    const grade = !gradeValue || gradeValue.toUpperCase() === "ALL" ? t("table.target.all") : gradeValue;

    return `${dept} ${t("table.target.separator")} ${grade}`;
  };

  const buildDetailUrl = (r: DiagnosisListItemDto) => {
    const params = new URLSearchParams();
    if (r.startedAt) {
      params.set("startedAt", r.startedAt);
      params.set("start", r.startedAt);
    }
    if (r.endedAt) {
      params.set("endedAt", r.endedAt);
      params.set("end", r.endedAt);
    }
    const query = params.toString();
    return `/admin/competencies/dignosis/${r.diagnosisId}${query ? `?${query}` : ""}`;
  };

  const buildResultUrl = (r: DiagnosisListItemDto) => {
    const params = new URLSearchParams();
    params.set("dignosisId", String(r.diagnosisId));
    params.set("status", r.status);

    if (r.semesterId !== undefined && r.semesterId !== null && String(r.semesterId).trim()) {
      params.set("semesterId", String(r.semesterId));
    } else if (r.semesterName?.trim()) {
      params.set("semesterName", r.semesterName.trim());
    }

    const deptIdValue = r.deptId ?? r.departmentId;
    if (deptIdValue !== undefined && deptIdValue !== null && String(deptIdValue).trim()) {
      params.set("deptId", String(deptIdValue));
    }

    const deptName = r.deptName?.trim();
    if (deptName && deptName.toUpperCase() !== "ALL") {
      params.set("deptName", deptName);
    }

    return `/admin/competencies/dignosis/result?${params.toString()}`;
  };

  const columns: Array<TableColumn<DiagnosisListItemDto>> = [
    {
      header: t("table.headers.number"),
      align: "center",
      cellClassName: styles.numberCell,
      render: (r) => formatNumber(r.diagnosisId),
    },
    {
      header: t("table.headers.title"),
      align: "center",
      cellClassName: styles.titleCell,
      render: (r) => r.title,
    },
    {
      header: t("table.headers.target"),
      align: "center",
      cellClassName: styles.targetCell,
      render: (r) => formatDeptGrade(r.deptName, r.targetGrade),
    },
    {
      header: t("table.headers.period"),
      align: "center",
      cellClassName: styles.periodCell,
      render: (r) => formatPeriod(r.startedAt, r.endedAt),
    },
    {
      header: t("table.headers.createdAt"),
      align: "center",
      cellClassName: styles.dateCell,
      render: (r) => formatDate(r.createdAt),
    },
    {
      header: t("table.headers.status"),
      align: "center",
      cellClassName: styles.statusCell,
      render: (r) => <StatusPill status={r.status as any} label={getStatusLabel(r.status)} />,
    },
    {
      header: t("table.headers.manage"),
      width: 240,
      align: "center",
      stopRowClick: true,
      render: (r) => {
        const showEdit = canEdit(r.status);
        const showDelete = canDelete(r.status);

        return (
          <div className={styles.manageCell}>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(buildDetailUrl(r));
              }}
            >
              {t("table.buttons.detail")}
            </Button>
            {showEdit && (
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(r.diagnosisId);
                }}
              >
                {t("table.buttons.edit")}
              </Button>
            )}
            {showDelete && (
              <Button
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(r.diagnosisId);
                }}
              >
                {t("table.buttons.delete")}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table<DiagnosisListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.diagnosisId}
      emptyText={t("table.emptyText")}
      onRowClick={(r) => {
        if (!isClosedStatus(r.status)) {
          toast.error(t("messages.notClosed"));
          return;
        }
        router.push(buildResultUrl(r));
      }}
    />
  );
}
