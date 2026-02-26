"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./OfferingStudentsTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { enrollmentStatusLabel, completionStatusLabel } from "@/features/admin/curricular-offering/utils/studentStatusLable";
import { CurricularOfferingStudentListItemDto } from "@/features/admin/curricular-offering/api/types";
import { useState } from "react";
import { updateStudentScore } from "@/features/admin/curricular-offering/api/curricularOfferingsApi";
import { OfferingStatus } from "@/features/admin/curricular/api/types";
import toast from "react-hot-toast"

type Props = {
  offeringId: number;
  offeringStatus: OfferingStatus
  items: CurricularOfferingStudentListItemDto[];
  loading: boolean;
  onSaved?: () => void | Promise<void>;
};

export function OfferingStudentsTable({ offeringId, offeringStatus, items, loading, onSaved }: Props) {
  const [editId, setEditId] = useState<number | null>(null); // 현재 편집중 enrollmentId
  const [editRawScore, setEditRawScore] = useState<string>(""); // input 값
  const [savingId, setSavingId] = useState<number | null>(null); // 저장중인 row 

  const canEditScore = offeringStatus === "IN_PROGRESS"

  const startEdit = (r: CurricularOfferingStudentListItemDto) => {
    setEditId(r.enrollmentId);
    setEditRawScore(r.rawScore != null ? String(r.rawScore) : "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditRawScore("");
  }

  const saveEdit = async (enrollmentId: number) => {
    const n = Number(editRawScore);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error("점수는 0 ~ 100 사이 숫자만 입력할 수 있어요");
      return;
    };

    setSavingId(enrollmentId);
    const tId = toast.loading("저장중...")
    try {
      await updateStudentScore(offeringId, enrollmentId, { rawScore: n });

      toast.success("점수가 저장되었습니다.", {id: tId});
      setEditId(null);
      setEditRawScore("");

      if (onSaved) await onSaved();
      
      } catch (e: any) {
        // ✅ 가능한 메시지 뽑기 (getJson 에러 형태에 따라 다를 수 있음)
        const msg =
          e?.message ||
          e?.error?.message ||
          "저장에 실패했습니다. 잠시 후 다시 시도해주세요.";

        toast.error(msg, { id: tId });
      } finally {
        setSavingId(null);
      }
  };

  const columns: Array<TableColumn<CurricularOfferingStudentListItemDto>> = [
    { header: "학생명", align: "center", render: (r) => r.studentName },
    { header: "학번", align: "center", render: (r) => r.studentNo },
    { header: "학년", align: "center", render: (r) => r.gradeLevel },
    { header: "소속학과", align: "center", render: (r) => r.deptName },
    {
      header: "점수",
      align: "center",
      stopRowClick: true,
      render: (r) => {
        const isEditing = editId === r.enrollmentId;
        const isSaving = savingId === r.enrollmentId;

        if (!isEditing) return r.rawScore ?? "-";

        return (
          <input
            className={styles.scoreInput}
            value={editRawScore}
            onChange={(e) => setEditRawScore(e.target.value)}
            inputMode="numeric"
            disabled={isSaving}
          />
        );
      },
    },
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
      width: 180,
      align: "center",
      stopRowClick: true,
      render: (r) => {
        const isEditing = editId === r.enrollmentId;
        const isSaving = savingId === r.enrollmentId;
        const hasScore = r.rawScore != null

        if (!isEditing) {
          return (
            <div className={styles.manageCell}>
            <Button
              variant="secondary"
              onClick={() => startEdit(r)}
              disabled={!canEditScore}
              title={!canEditScore ? "수강중(IN_PROGRESS) 상태에서만 점수 수정이 가능합니다." : undefined}
            >
              {hasScore ? "수정" : "입력"}
            </Button>

            </div>
          );
        }

        return (
          <div className={styles.manageCell}>
            <Button
              onClick={() => saveEdit(r.enrollmentId)}
              disabled={isSaving || !canEditScore}
            >
              {isSaving ? "저장중..." : "저장"}
            </Button>

            <Button variant="secondary" onClick={cancelEdit} disabled={isSaving}>
              취소
            </Button>
          </div>
        );
      },
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
