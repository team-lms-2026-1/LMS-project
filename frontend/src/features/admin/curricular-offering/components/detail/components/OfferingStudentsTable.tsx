"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./OfferingStudentsTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { CurricularOfferingStudentListItemDto } from "@/features/admin/curricular-offering/api/types";
import { useState } from "react";
import { updateStudentScore } from "@/features/admin/curricular-offering/api/curricularOfferingsApi";
import { OfferingStatus } from "@/features/admin/curricular/api/types";
import toast from "react-hot-toast"
import { useI18n } from "@/i18n/useI18n";

type Props = {
    offeringId: number;
    offeringStatus: OfferingStatus
    items: CurricularOfferingStudentListItemDto[];
    loading: boolean;
    onSaved?: () => void | Promise<void>;
};

export function OfferingStudentsTable({ offeringId, offeringStatus, items, loading, onSaved }: Props) {
    const t = useI18n("curricular.adminOfferingDetail.students");
    const tCommon = useI18n("curricular.common");
    const tEnrollment = useI18n("curricular.status.enrollment");
    const tCompletion = useI18n("curricular.status.completion");

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
            toast.error(t("messages.scoreRange"));
            return;
        };

        setSavingId(enrollmentId);
        const tId = toast.loading(t("messages.savingToast"))
        try {
            await updateStudentScore(offeringId, enrollmentId, { rawScore: n });

            toast.success(t("messages.savedToast"), { id: tId });
            setEditId(null);
            setEditRawScore("");

            if (onSaved) await onSaved();

        } catch (e: any) {
            // ✅ 가능한 메시지 뽑기 (getJson 에러 형태에 따라 다를 수 있음)
            const msg =
                e?.message ||
                e?.error?.message ||
                t("messages.saveFailed");

            toast.error(msg, { id: tId });
        } finally {
            setSavingId(null);
        }
    };

    const enrollmentStatusLabel = (value: string) => {
        switch (value) {
            case "ENROLLED":
                return tEnrollment("ENROLLED");
            case "CANCELED":
                return tEnrollment("CANCELED");
            default:
                return value;
        }
    };

    const completionStatusLabel = (value: string) => {
        switch (value) {
            case "IN_PROGRESS":
                return tCompletion("IN_PROGRESS");
            case "PASSED":
                return tCompletion("PASSED");
            case "FAILED":
                return tCompletion("FAILED");
            default:
                return value;
        }
    };

    const columns: Array<TableColumn<CurricularOfferingStudentListItemDto>> = [
        { header: t("headers.studentName"), align: "center", render: (r) => r.studentName },
        { header: t("headers.studentNo"), align: "center", render: (r) => r.studentNo },
        { header: t("headers.gradeLevel"), align: "center", render: (r) => r.gradeLevel },
        { header: t("headers.deptName"), align: "center", render: (r) => r.deptName },
        {
            header: t("headers.rawScore"),
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
        { header: t("headers.grade"), align: "center", render: (r) => r.grade },
        {
            header: t("headers.enrollmentStatus"), align: "center", render: (r) => (
                <StatusPill
                    status={r.enrollmentStatus as any}
                    label={enrollmentStatusLabel(r.enrollmentStatus)}
                />
            )
        },

        {
            header: t("headers.completionStatus"), align: "center", render: (r) => (
                <StatusPill
                    status={r.completionStatus as any}
                    label={completionStatusLabel(r.completionStatus)}
                />
            )
        },
        {
            header: t("headers.scoreAction"),
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
                                title={!canEditScore ? t("messages.canEditOnlyInProgress") : undefined}
                            >
                                {hasScore ? tCommon("editButton") : t("buttons.input")}
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
                            {isSaving ? t("buttons.saving") : tCommon("saveButton")}
                        </Button>

                        <Button variant="secondary" onClick={cancelEdit} disabled={isSaving}>
                            {tCommon("cancelButton")}
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
            emptyText={t("emptyText")}
        />
    );
}