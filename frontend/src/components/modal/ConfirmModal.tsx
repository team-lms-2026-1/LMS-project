"use client";

import { Modal } from "./Modal";
import { Button } from "../button/Button";
import styles from "./Modal.module.css";

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    type?: "primary" | "danger" | "warning";
}

export function ConfirmModal({
    open,
    title = "확인",
    message,
    onConfirm,
    onCancel,
    confirmText = "확인",
    cancelText = "취소",
    loading = false,
    type = "primary"
}: ConfirmModalProps) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title}
            size="sm"
            footer={
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={type === "danger" ? "danger" : "primary"}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <div style={{ padding: "20px 0", fontSize: "1rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                {message}
            </div>
        </Modal>
    );
}
