"use client";

import React from "react";
import styles from "./ReserveConfirmModal.module.css";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

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
  const t = useI18n("studySpace.student.spaces.reserveConfirmModal");
  const hasTime = !!startTime && !!endTime;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("title")}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            {t("buttons.submit")}
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
              {t("questionWithRoom")}
            </>
          ) : (
            <>{t("questionWithoutRoom")}</>
          )}
        </p>

        <div className={styles.meta}>
          {rentalDate && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>{t("labels.date")}</span>
              <span className={styles.metaValue}>{rentalDate}</span>
            </div>
          )}
          {hasTime && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>{t("labels.time")}</span>
              <span className={styles.metaValue}>
                {startTime} ~ {endTime}
              </span>
            </div>
          )}
        </div>

        <p className={styles.sub}>{t("description")}</p>
      </div>
    </Modal>
  );
}
