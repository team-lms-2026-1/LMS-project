"use client";

import React from "react";
import styles from "./DeleteModal.module.css";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import type { QnaDeleteModalProps } from "../../api/types";


export default function DeleteModal({
  open,
  targetLabel = "Q&A",
  targetTitle,
  onConfirm,
  onClose,
  loading = false,
}: QnaDeleteModalProps) {
  return (
    <ConfirmDialog
      open={open}
      title={`${targetLabel} 삭제`}
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
                {targetLabel}을(를) 삭제할까요?
              </>
            ) : (
              <>{targetLabel}을(를) 삭제할까요?</>
            )}
          </p>

          <p className={styles.sub}>삭제한 데이터는 복구할 수 없습니다.</p>
        </div>
      }
    />
  );
}
