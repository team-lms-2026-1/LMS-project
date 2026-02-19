"use client";

import { Modal } from "./Modal";
import styles from "./Modal.module.css";
import { useLocale } from "@/hooks/useLocale";
import {
  getConfirmDefaultCancelText,
  getConfirmDefaultConfirmText,
  getConfirmDefaultTitle,
  getConfirmLoadingText,
} from "@/components/localeText";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
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
  const { locale } = useLocale();
  const resolvedTitle = title ?? getConfirmDefaultTitle(locale);
  const resolvedConfirmText = confirmText ?? getConfirmDefaultConfirmText(locale);
  const resolvedCancelText = cancelText ?? getConfirmDefaultCancelText(locale);
  const loadingText = getConfirmLoadingText(locale);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={resolvedTitle}
      size="sm"
      footer={
        <>
          <button type="button" className={styles.btn} onClick={onCancel} disabled={loading}>
            {resolvedCancelText}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${danger ? styles.danger : styles.primary}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingText : resolvedConfirmText}
          </button>
        </>
      }
    >
      {description ? <div className={styles.muted}>{description}</div> : null}
    </Modal>
  );
}
