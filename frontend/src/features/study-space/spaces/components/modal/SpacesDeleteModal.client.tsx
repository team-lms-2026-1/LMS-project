"use client";

import React from "react";
import styles from "./SpacesDeleteModal.module.css";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";

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
  return (
    <ConfirmDialog
      open={open}
      title="학습공간 삭제"
      danger
      loading={loading}
      confirmText="삭제"
      cancelText="취소"
      onConfirm={onConfirm}
      onCancel={onClose}
      description={
        <div className={styles.desc}>
          <p className={styles.main}>
            {targetTitle ? (
              <>
                <b className={styles.emph}>&quot;{targetTitle}&quot;</b>
                <br />
                학습공간을 삭제하시겠습니까?
              </>
            ) : (
              <>학습공간을 삭제하시겠습니까?</>
            )}
          </p>
          <p className={styles.sub}>해당 학습공간에 포함된 스터디룸도 삭제됩니다.</p>
          <p className={styles.sub}>삭제한 데이터는 복구할 수 없습니다.</p>
        </div>
      }
    />
  );
}
