"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/mentoring.module.css";
import {
    fetchApplications,
    updateApplicationStatus,
} from "../lib/api";
import type { MentoringApplication, MentoringStatus } from "../types";
import { Table } from "@/components/table/Table";
import { StatusPill } from "@/components/status/StatusPill";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";
import type { TableColumn } from "@/components/table/types";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

type Props = {
    recruitmentId: number;
};

export default function MentoringApplicationList({ recruitmentId }: Props) {
    const router = useRouter();
    const [items, setItems] = useState<MentoringApplication[]>([]);
    const [loading, setLoading] = useState(true);

    // Reject Modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Approve Modal
    const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const fetchData = () => {
        setLoading(true);
        fetchApplications(recruitmentId)
            .then((res) => setItems(res))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (recruitmentId) fetchData();
    }, [recruitmentId]);

    const handleStatusUpdate = async (id: number, status: MentoringStatus, reason?: string) => {
        try {
            setProcessing(true);
            await updateApplicationStatus(id, { status, rejectReason: reason });
            toast.success(status === "APPROVED" ? "승인되었습니다." : "반려되었습니다.");
            fetchData();
        } catch (e) {
            toast.error("처리 실패");
        } finally {
            setProcessing(false);
        }
    };

    const openApproveModal = (id: number) => {
        setApproveTargetId(id);
    };

    const handleApproveConfirm = async () => {
        if (approveTargetId) {
            await handleStatusUpdate(approveTargetId, "APPROVED");
            setApproveTargetId(null);
        }
    };

    const openRejectModal = (id: number) => {
        setRejectTargetId(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (rejectTargetId) {
            await handleStatusUpdate(rejectTargetId, "REJECTED", rejectReason);
            setRejectModalOpen(false);
        }
    };

    const columns = useMemo<TableColumn<MentoringApplication>[]>(
        () => [
            { header: "역할", field: "role", width: "100px" },
            { header: "이름", field: "name", render: (row) => `${row.name} (${row.loginId})` },
            { header: "신청일시", field: "appliedAt", render: (row) => new Date(row.appliedAt).toLocaleString() },
            { header: "상태", field: "status", align: "center", render: (row) => <StatusPill status={row.status === "APPROVED" ? "ACTIVE" : row.status === "REJECTED" ? "INACTIVE" : "PENDING"} label={row.status} /> },
            {
                header: "관리",
                field: "applicationId",
                align: "right",
                render: (row) => (
                    <div className={styles.actions}>
                        {row.status === "APPLIED" && (
                            <>
                                <Button className={styles.smBtn} onClick={() => openApproveModal(row.applicationId)}>승인</Button>
                                <Button className={styles.smBtn} variant="secondary" onClick={() => openRejectModal(row.applicationId)}>반려</Button>
                            </>
                        )}
                    </div>
                )
            }
        ],
        []
    );

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div className={styles.title}>신청 결과 조회</div>
                <Button variant="secondary" onClick={() => router.back()}>뒤로가기</Button>
            </div>

            <div className={styles.tableWrap}>
                <Table
                    columns={columns}
                    items={items}
                    rowKey={(r) => r.applicationId}
                    loading={loading}
                    emptyText="신청 내역이 없습니다."
                />
            </div>

            {/* Reject Modal */}
            <Modal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="반려 사유"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>취소</Button>
                        <Button onClick={handleRejectConfirm} variant="danger">반려</Button>
                    </>
                }
            >
                <textarea
                    className={styles.textarea}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력해주세요"
                    style={{ width: "100%" }}
                />
            </Modal>

            {/* Approve Confirm Modal */}
            <ConfirmModal
                open={!!approveTargetId}
                message="이 신청을 승인하시겠습니까?"
                onConfirm={handleApproveConfirm}
                onCancel={() => setApproveTargetId(null)}
                loading={processing}
            />
        </div>
    );
}
