"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/privacyExcelModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirmDownload: (reason: string) => void;
};

export default function PrivacyExcelDownloadModal({ open, onClose, onConfirmDownload }: Props) {
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
        <div className={styles.title}>개인정보 이용 안내</div>

        <div className={styles.desc}>
          <p>본 엑셀 파일에는 학생의 개인정보가 포함되어 있습니다.</p>
          <p>해당 정보는 학사 행정 및 내부 업무 목적으로만 사용 가능하며, 목적 외 사용, 제3자 제공, 무단 저장 및 외부 유출을 금지합니다.</p>
          <p>관련 법령에 따라 개인정보 접근 및 다운로드 이력은 관리자로 로그로 기록·관리되며, 위반 시 법적 책임이 발생할 수 있습니다.</p>
          <p>위 내용을 충분히 숙지하였으며, 개인정보 이용에 동의합니다.</p>
        </div>

        <label className={styles.checkRow}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>위 개인정보 이용에 동의합니다.</span>
        </label>

        <div className={styles.reasonTitle}>다운로드 사유</div>
        <textarea
          className={styles.textarea}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="다운로드 사유를 입력하세요."
        />

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button className={styles.downloadBtn} disabled={!canDownload} onClick={() => onConfirmDownload(reason)}>
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
