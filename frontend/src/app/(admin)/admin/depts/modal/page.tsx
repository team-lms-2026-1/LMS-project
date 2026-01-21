"use client";
import { useState } from "react";
import styles from "./DeptCreate.module.css";

export default function DeptCreatePage() {
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState("");

  return (
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

      <button
        className={styles.submitButton}
        onClick={() => {
          // TODO: 나중에 API 붙이기
          console.log({ deptCode, deptName, description });

          // 일단은 목록으로만 돌려보내기
          window.location.href = "/admin/depts";
        }}
      >
        학과 생성
      </button>
    </div>
  );
}
