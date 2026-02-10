import React, { useState } from "react";
import styles from "./RejectedModal.module.css";
import { Button } from "@/components/button";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
};

export default function RejectedModal({ open, onClose, onConfirm }: Props) {
    const [reason, setReason] = useState("");

    if (!open) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error("반려 사유를 입력해주세요.");
            return;
        }
        onConfirm(reason);
        setReason(""); // Reset and close handled by parent usually, but resetting here is safe
        onClose();
    };

    const handleClose = () => {
        setReason("");
        onClose();
    };

    return (
        <div className={styles.overlay} onMouseDown={handleClose}>
            <div
                className={styles.modal}
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>반려 사유 입력</h2>
                    <button className={styles.closeBtn} onClick={handleClose}>×</button>
                </div>

                <div className={styles.body}>
                    <label className={styles.label}>사유를 입력하세요</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="예: 신청하신 시간에 예약이 꽉 찼습니다."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                    <Button variant="danger" onClick={handleSubmit}>
                        반려
                    </Button>
                </div>
            </div>
        </div>
    );
}
