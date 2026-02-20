"use client";

import React from "react";
import styles from "./DeleteModal.module.css";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import type { NoticeDeleteModalProps } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";


export default function DeleteModal({
  open,
  targetLabel,
  targetTitle,
  onConfirm,
  onClose,
  loading = false,
}: NoticeDeleteModalProps) {
  const t = useI18n("community.notices.admin.deleteModal");
  const resolvedTargetLabel = targetLabel ?? t("defaultTargetLabel");

  return (
    <ConfirmDialog
      open={open}
      title={t("title", { targetLabel: resolvedTargetLabel })}
      danger
      loading={loading}
      confirmText={t("confirmText")}
      cancelText={t("cancelText")}
      onConfirm={onConfirm}
      onCancel={onClose}
      description={
        <div className={styles.desc}>
          <p className={styles.main}>
            {targetTitle ? (
              <>
                <b className={styles.emph}>&quot;{targetTitle}&quot;</b>
                <br />
                {t("question", { targetLabel: resolvedTargetLabel })}
              </>
            ) : (
              <>{t("question", { targetLabel: resolvedTargetLabel })}</>
            )}
          </p>

          <p className={styles.sub}>
            {t("warning")}
          </p>
        </div>
      }
    />
  );
}
