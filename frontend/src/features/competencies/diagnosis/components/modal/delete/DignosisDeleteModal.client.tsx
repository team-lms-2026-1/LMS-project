"use client";

import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import styles from "./DignosisDeleteModal.module.css";
import type { DiagnosisDeleteModalProps } from "@/features/competencies/diagnosis/api/types";

export default function DignosisDeleteModal({
  open,
  targetTitle,
  onConfirm,
  onClose,
  loading = false,
}: DiagnosisDeleteModalProps) {
  return (
    <ConfirmDialog
      open={open}
      title="진단지 삭제"
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
                진단지를 삭제하시겠습니까?
              </>
            ) : (
              <>진단지를 삭제하시겠습니까?</>
            )}
          </p>
          <p className={styles.sub}>삭제된 진단지는 복구할 수 없습니다.</p>
        </div>
      }
    />
  );
}
