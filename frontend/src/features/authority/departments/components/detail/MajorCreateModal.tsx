"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/MajorCreateModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; code: string; description: string }) => void;
};

export default function MajorCreateModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setCode("");
    setDescription("");
  }, [open]);

  if (!open) return null;

  const canSubmit = name.trim().length > 0 && code.trim().length > 0;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.title}>전공 추가</div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>전공명</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 인공지능"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>전공코드</label>
            <input
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예) C002"
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>설명</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="전공 설명"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!canSubmit}
            onClick={() => onSubmit({ name: name.trim(), code: code.trim(), description })}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
