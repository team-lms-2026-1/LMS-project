"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/privacyExcelModal.module.css";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirmDownload: (reason: string) => void;
};

export default function PrivacyExcelDownloadModal({ open, onClose, onConfirmDownload }: Props) {
  const t = useI18n("systemStatus.accountLogs.privacyModal");
  const [agreed, setAgreed] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setAgreed(false);
      setReason("");
    }
  }, [open]);

  const canDownload = useMemo(() => agreed && reason.trim().length > 0, [agreed, reason]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.title}>{t("title")}</div>

        <div className={styles.desc}>
          <p>{t("desc.line1")}</p>
          <p>{t("desc.line2")}</p>
          <p>{t("desc.line3")}</p>
          <p>{t("desc.line4")}</p>
        </div>

        <label className={styles.checkRow}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>{t("agreeLabel")}</span>
        </label>

        <div className={styles.reasonTitle}>{t("reasonTitle")}</div>
        <textarea
          className={styles.textarea}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("reasonPlaceholder")}
        />

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t("buttons.cancel")}
          </button>
          <button className={styles.downloadBtn} disabled={!canDownload} onClick={() => onConfirmDownload(reason)}>
            {t("buttons.download")}
          </button>
        </div>
      </div>
    </div>
  );
}
