"use client";

import { useState } from "react";
import styles from "./DeptCreate.module.css";

type DeptmodalProps = {
  onClose: () => void;
};

export default function Deptmodal({ onClose }: DeptmodalProps) {
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose} // 바깥 클릭 시 닫기
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // 안쪽 클릭은 전파 막기
      >
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>학과 등록</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className={styles.modalBody}>
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
        </div>

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              // TODO: 나중에 API 붙이기
              console.log({ deptCode, deptName, description });
              onClose();
            }}
          >
            학과 생성
          </button>
        </div>
      </div>
    </div>
  );
}
