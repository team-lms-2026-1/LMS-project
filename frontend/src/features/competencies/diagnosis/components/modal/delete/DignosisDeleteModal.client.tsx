"use client";

import { useI18n } from "@/i18n/useI18n";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import type { DiagnosisDeleteModalProps } from "@/features/competencies/diagnosis/api/types";
import styles from "./DignosisDeleteModal.module.css";

export default function DignosisDeleteModal({
  open,
  targetTitle,
  onConfirm,
  onClose,
  loading = false,
}: DiagnosisDeleteModalProps) {
  const t = useI18n("competency.adminDiagnosis.list.deleteModal");

  return (
    <ConfirmDialog
      open={open}
      title={t("title")}
      danger
      loading={loading}
      confirmText={t("confirmText")}
      cancelText={t("cancelText")}
      onConfirm={onConfirm}
      onCancel={onClose}
      description={
        <div className={styles.desc}>
          <p className={styles.main}>
            {targetTitle ? t("questionWithTitle", { title: targetTitle }) : t("question")}
          </p>
          <p className={styles.sub}>{t("sub")}</p>
        </div>
      }
    />
  );
}
