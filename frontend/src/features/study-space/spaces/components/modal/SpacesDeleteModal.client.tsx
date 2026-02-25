"use client";

import React from "react";
import styles from "./SpacesDeleteModal.module.css";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  open: boolean;
  targetTitle?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
};

export default function SpacesDeleteModal({
  open,
  targetTitle,
  onConfirm,
  onClose,
  loading = false,
}: Props) {
  const t = useI18n("studySpace.admin.spaces.deleteModal");

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
            {targetTitle ? (
              <>
                <b className={styles.emph}>&quot;{targetTitle}&quot;</b>
                <br />
                {t("questionWithTitle")}
              </>
            ) : (
              <>{t("questionWithoutTitle")}</>
            )}
          </p>
          <p className={styles.sub}>{t("warnings.includedRooms")}</p>
          <p className={styles.sub}>{t("warnings.cannotRestore")}</p>
        </div>
      }
    />
  );
}
