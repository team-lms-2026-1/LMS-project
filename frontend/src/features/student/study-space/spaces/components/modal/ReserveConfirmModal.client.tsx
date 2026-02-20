"use client";

import React from "react";
import styles from "./ReserveConfirmModal.module.css";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";

type Props = {
  open: boolean;
  roomName?: string;
  rentalDate?: string;
  startTime?: string;
  endTime?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
};

export default function ReserveConfirmModal({
  open,
  roomName,
  rentalDate,
  startTime,
  endTime,
  onConfirm,
  onClose,
  loading = false,
}: Props) {
  const hasTime = !!startTime && !!endTime;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="예약 신청"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            신청
          </Button>
        </>
      }
    >
      <div className={styles.desc}>
        <p className={styles.main}>
          {roomName ? (
            <>
              <b className={styles.emph}>&quot;{roomName}&quot;</b>
              <br />
              예약을 신청할까요?
            </>
          ) : (
            <>예약을 신청할까요?</>
          )}
        </p>

        <div className={styles.meta}>
          {rentalDate && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>날짜</span>
              <span className={styles.metaValue}>{rentalDate}</span>
            </div>
          )}
          {hasTime && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>시간</span>
              <span className={styles.metaValue}>
                {startTime} ~ {endTime}
              </span>
            </div>
          )}
        </div>

        <p className={styles.sub}>신청 후에는 승인 결과를 기다려주세요.</p>
      </div>
    </Modal>
  );
}
