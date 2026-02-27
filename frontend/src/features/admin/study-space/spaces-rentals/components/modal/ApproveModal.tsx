import React from "react";
import styles from "./RejectedModal.module.css";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export default function ApproveModal({ open, onClose, onConfirm, loading = false }: Props) {
  const t = useI18n("studySpace.admin.rentals.approveModal");
  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleConfirm = () => {
    if (loading) return;
    onConfirm();
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
          <button className={styles.closeBtn} onClick={handleClose} aria-label={t("closeAriaLabel")}>
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.label}>{t("description")}</div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={loading}>
            {loading ? t("buttons.processing") : t("buttons.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
