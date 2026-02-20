"use client";

import { Modal } from "./Modal";
import { Button } from "../button/Button";
import styles from "./Modal.module.css";
import { useLocale } from "@/hooks/useLocale";
import {
  getConfirmDefaultCancelText,
  getConfirmDefaultConfirmText,
  getConfirmDefaultTitle,
} from "@/components/localeText";

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
    title,
    message,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    loading = false,
    type = "primary"
}: ConfirmModalProps) {
    const { locale } = useLocale();
    const resolvedTitle = title ?? getConfirmDefaultTitle(locale);
    const resolvedConfirmText = confirmText ?? getConfirmDefaultConfirmText(locale);
    const resolvedCancelText = cancelText ?? getConfirmDefaultCancelText(locale);

    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={resolvedTitle}
            size="sm"
            footer={
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>
                        {resolvedCancelText}
                    </Button>
                    <Button
                        variant={type === "danger" ? "danger" : "primary"}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {resolvedConfirmText}
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
