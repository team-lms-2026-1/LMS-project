"use client";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import type { DiagnosisListItemDto, DiagnosisStatus, DiagnosisTableProps } from "../../api/types";
import styles from "./DiagnosisTable.module.css";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

function formatDeptGrade(deptName?: string, targetGrade?: string) {
  const dept = !deptName || deptName === "All" ? "전체" : deptName;
  const grade = targetGrade ?? "-";
  return `${dept} · ${grade}`;
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
  const router = useRouter();
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
    if (deptName && deptName !== "All" && deptName !== "전체") {
      params.set("deptName", deptName);
    }
    return `/admin/competencies/dignosis/result?${params.toString()}`;
  };
  const columns: Array<TableColumn<DiagnosisListItemDto>> = [
    {
      header: "번호",
      align: "center",
      cellClassName: styles.numberCell,
      render: (r) => formatNumber(r.diagnosisId),
    },
    {
      header: "제목",
      align: "center",
      cellClassName: styles.titleCell,
      render: (r) => r.title,
    },
    {
      header: "대상 학과·학년",
      align: "center",
      cellClassName: styles.targetCell,
      render: (r) => formatDeptGrade(r.deptName, r.targetGrade),
    },
    {
      header: "제출기간",
      align: "center",
      cellClassName: styles.periodCell,
      render: (r) => formatPeriod(r.startedAt, r.endedAt),
    },
    {
      header: "작성일",
      align: "center",
      cellClassName: styles.dateCell,
      render: (r) => formatDate(r.createdAt),
    },
    {
      header: "상태",
      align: "center",
      cellClassName: styles.statusCell,
      render: (r) => <StatusPill status={r.status as any} label={r.status} />,
    },
    {
      header: "관리",
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
              상세
            </Button>
            {showEdit && (
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(r.diagnosisId);
                }}
              >
                수정
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
                삭제
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
      emptyText="조회된 진단지가 없습니다."
      onRowClick={(r) => {
        if (!isClosedStatus(r.status)) {
          toast.error("진단이 마감되지 않았습니다.");
          return;
        }
        router.push(buildResultUrl(r));
      }}
    />
  );
}
