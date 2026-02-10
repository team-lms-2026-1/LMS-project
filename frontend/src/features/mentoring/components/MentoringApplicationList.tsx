"use client";

import { useState } from "react";
import styles from "../styles/mentoring.module.css";
import { updateApplicationStatus } from "../api/mentoringApi";
import { useMentoringApplicationList } from "../hooks/useMentoringApplicationList";
import { MentoringApplicationsTable } from "./MentoringApplicationsTable";
import type { MentoringApplication, MentoringStatus } from "../api/types";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

type Props = {
    recruitmentId: number;
};

export default function MentoringApplicationList({ recruitmentId }: Props) {
    const { items, loading, refresh } = useMentoringApplicationList(recruitmentId);

    const [processing, setProcessing] = useState(false);
    const [selectedApp, setSelectedApp] = useState<MentoringApplication | null>(null);
    const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const handleStatusUpdate = async (id: number, status: MentoringStatus, reason?: string) => {
        try {
            setProcessing(true);
            await updateApplicationStatus(id, { status, rejectReason: reason });
            toast.success(status === "APPROVED" ? "승인되었습니다." : "반려되었습니다.");
            refresh();
        } catch (e: any) {
            toast.error("처리 실패: " + (e.message || "Unknown error"));
        } finally {
            setProcessing(false);
        }
    };

    const handleApproveConfirm = async () => {
        if (approveTargetId) {
            await handleStatusUpdate(approveTargetId, "APPROVED");
            setApproveTargetId(null);
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) {
            toast.error("반려 사유를 입력해주세요.");
            return;
        }
        if (rejectTargetId) {
            await handleStatusUpdate(rejectTargetId, "REJECTED", rejectReason);
            setRejectTargetId(null);
            setRejectReason("");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>신청 내역 관리</h1>
            </div>

            <div className={styles.tableWrap}>
                <MentoringApplicationsTable
                    items={items}
                    loading={loading}
                    onRowClick={(a) => setSelectedApp(a)}
                />
            </div>

            {/* Application Detail Modal */}
            <Modal
                open={!!selectedApp}
                title="신청 정보 상세"
                onClose={() => setSelectedApp(null)}
                footer={
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
                        {selectedApp?.status === "APPLIED" && (
                            <>
                                <Button onClick={() => { setApproveTargetId(selectedApp.applicationId); setSelectedApp(null); }}>승인</Button>
                                <Button variant="secondary" onClick={() => { setRejectTargetId(selectedApp.applicationId); setRejectReason(""); setSelectedApp(null); }}>반려</Button>
                            </>
                        )}
                        <Button variant="secondary" onClick={() => setSelectedApp(null)}>닫기</Button>
                    </div>
                }
            >
                {selectedApp && (
                    <div className={styles.form}>
                        <div className={styles.grid2}>
                            <label className={styles.field}>
                                <div className={styles.label}>이름</div>
                                <div className={styles.input}>{selectedApp.name} ({selectedApp.loginId})</div>
                            </label>
                            <label className={styles.field}>
                                <div className={styles.label}>학과</div>
                                <div className={styles.input}>{selectedApp.deptName || "-"}</div>
                            </label>
                        </div>
                        <div className={styles.grid2}>
                            <label className={styles.field}>
                                <div className={styles.label}>연락처</div>
                                <div className={styles.input}>{selectedApp.phone || "-"}</div>
                            </label>
                            <label className={styles.field}>
                                <div className={styles.label}>이메일</div>
                                <div className={styles.input}>{selectedApp.email || "-"}</div>
                            </label>
                        </div>
                        <label className={styles.field}>
                            <div className={styles.label}>신청 역할</div>
                            <div className={styles.input}>{selectedApp.role === "MENTOR" ? "멘토" : "멘티"}</div>
                        </label>
                        <label className={styles.field}>
                            <div className={styles.label}>신청 사유</div>
                            <div className={styles.textarea} style={{ backgroundColor: "#f9fafb" }}>
                                {selectedApp.applyReason || "내용 없음"}
                            </div>
                        </label>
                    </div>
                )}
            </Modal>

            {/* Approval Confirm Modal */}
            <ConfirmModal
                open={!!approveTargetId}
                message="이 신청을 승인하시겠습니까?"
                onConfirm={handleApproveConfirm}
                onCancel={() => setApproveTargetId(null)}
                loading={processing}
            />

            {/* Rejection Modal */}
            <Modal
                open={!!rejectTargetId}
                onClose={() => setRejectTargetId(null)}
                title="반려 사유 입력"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setRejectTargetId(null)}>취소</Button>
                        <Button onClick={handleRejectConfirm} variant="danger" loading={processing}>반려 처리</Button>
                    </>
                }
            >
                <label className={styles.field}>
                    <div className={styles.label}>반려 사유</div>
                    <textarea
                        className={styles.textarea}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="반려 사유를 입력해주세요"
                    />
                </label>
            </Modal>
        </div>
    );
}


