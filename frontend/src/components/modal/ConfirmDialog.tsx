"use client";

import { Modal } from "./Modal";
import styles from "./Modal.module.css";

export function ConfirmDialog({
  open,
  title = "확인",
  description,
  confirmText = "확인",
  cancelText = "취소",
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className={styles.btn} onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${danger ? styles.danger : styles.primary}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "처리 중..." : confirmText}
          </button>
        </>
      }
    >
      {description ? <div className={styles.muted}>{description}</div> : null}
    </Modal>
  );
}
