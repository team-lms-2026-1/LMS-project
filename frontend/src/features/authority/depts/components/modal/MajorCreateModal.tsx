"use client";

import { useState } from "react";
import styles from "../../styles/MajorCreateModal.module.css";


type MajorCreateModalProps = {
  onClose: () => void;
};

export default function MajorCreateModal({ onClose }: MajorCreateModalProps) {
  const [majorName, setMajorName] = useState("");
  const [majorCode, setMajorCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false); // 기본: 비활성화

  const handleSubmit = () => {
    // TODO: 나중에 API 연결 자리
    console.log({
      majorName,
      majorCode,
      description,
      isActive,
    });

    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.title}>전공 추가</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>전공이름</label>
            <input
              type="text"
              value={majorName}
              onChange={(e) => setMajorName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>전공코드</label>
            <input
              type="text"
              value={majorCode}
              onChange={(e) => setMajorCode(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* 활성/비활성 토글 */}
          <div className={styles.field}>
            <label className={styles.label}>사용 여부</label>
            <button
              type="button"
              className={`${styles.toggle} ${
                isActive ? styles.toggleOn : styles.toggleOff
              }`}
              onClick={() => setIsActive((prev) => !prev)}
            >
              <span className={styles.toggleCircle} />
              <span className={styles.toggleLabel}>
                {isActive ? "활성화" : "비활성화"}
              </span>
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

        {/* 푸터 */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSubmit}
          >
            전공 생성
          </button>
        </div>
      </div>
    </div>
  );
}
