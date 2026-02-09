import React from "react";
import styles from "./RejectedModal.module.css";
import { Button } from "@/components/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export default function ApproveModal({ open, onClose, onConfirm, loading = false }: Props) {
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
          <h2 className={styles.title}>승인 확인</h2>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="close">
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.label}>해당 신청을 승인하시겠습니까?</div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={loading}>
            {loading ? "처리 중.." : "승인"}
          </Button>
        </div>
      </div>
    </div>
  );
}
