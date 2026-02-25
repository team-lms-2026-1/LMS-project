import React, { useState } from "react";
import styles from "./RejectedModal.module.css";
import { Button } from "@/components/button";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
};

export default function RejectedModal({ open, onClose, onConfirm }: Props) {
    const t = useI18n("studySpace.admin.rentals.rejectModal");
    const [reason, setReason] = useState("");

    if (!open) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error(t("errors.reasonRequired"));
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
                    <h2 className={styles.title}>{t("title")}</h2>
                    <button className={styles.closeBtn} onClick={handleClose} aria-label={t("closeAriaLabel")}>×</button>
                </div>

                <div className={styles.body}>
                    <label className={styles.label}>{t("label")}</label>
                    <textarea
                        className={styles.textarea}
                        placeholder={t("placeholder")}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={handleClose}>
                        {t("buttons.cancel")}
                    </Button>
                    <Button variant="danger" onClick={handleSubmit}>
                        {t("buttons.confirm")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
