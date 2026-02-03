"use client";

import { useState } from "react";
import styles from "@/features/authority/depts/components/modal/DeptCreatePage.module.css";
import { createDept } from "@/features/authority/depts/api/deptsApi";

type DeptCreatePageProps = {
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
};

export default function DeptCreatePage({ onClose, onCreated }: DeptCreatePageProps) {
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!deptCode || !deptName) {
      setError("학과코드와 학과이름은 필수입니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createDept({
        deptCode,
        deptName,
        description,
        active: true,
      });

      if (onCreated) {
        await onCreated();
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("학과 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.page}>
          <h1 className={styles.title}>학과 등록</h1>

          <div className={styles.field}>
            <label className={styles.label}>학과코드</label>
            <input
              type="text"
              placeholder="재설정 불가합니다."
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>학과이름</label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "생성 중..." : "학과 생성"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
