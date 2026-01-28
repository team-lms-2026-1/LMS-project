"use client";

import { useState } from "react";
import styles from "../../styles/MajorCreateModal.module.css";
import { getJson } from "@/lib/http";

type Props = {
  deptId: string;
  onClose: () => void;
  onCreated?: () => void; // 생성 후 목록 refresh
};

export default function MajorCreateModal({ deptId, onClose, onCreated }: Props) {
  const [majorName, setMajorName] = useState("");
  const [majorCode, setMajorCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const body = {
        majorName,
        majorCode,
        description,
        active: isActive,
      };

      await getJson(`/api/bff/admin/depts/${deptId}/majors`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error("[MajorCreateModal] 전공 생성 실패:", err);
      alert("전공 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>전공 추가</h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>전공명</label>
            <input
              value={majorName}
              onChange={(e) => setMajorName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>전공코드</label>
            <input
              value={majorCode}
              onChange={(e) => setMajorCode(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>사용여부</label>
            <button
              type="button"
              className={`${styles.toggle} ${
                isActive ? styles.toggleOn : styles.toggleOff
              }`}
              onClick={() => setIsActive((prev) => !prev)}
            >
              <span className={styles.toggleCircle} />
              <span>{isActive ? "활성화" : "비활성화"}</span>
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.primaryButton} onClick={handleSubmit} disabled={loading}>
            {loading ? "생성 중..." : "전공 생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
