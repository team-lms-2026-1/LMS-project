// 위치: frontend/src/features/authority/depts/components/modal/Deptmodal.tsx

"use client";

import { useState } from "react";
import styles from "@/features/authority/depts/styles/DeptCreate.module.css";

type DeptmodalProps = {
  onClose: () => void;
};

export default function Deptmodal({ onClose }: DeptmodalProps) {
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Deptmodal.tsx 안 handleCreate

const handleCreate = async () => {
  if (!deptCode.trim() || !deptName.trim()) {
    alert("학과코드와 학과이름은 필수입니다.");
    return;
  }

  try {
    setSubmitting(true);

    const payload = {
      deptCode: deptCode.trim(),
      deptName: deptName.trim(),
      description: description.trim() || null,
      isActive: true, // ✅ 이거 꼭 넣기
    };

    const res = await fetch("/api/bff/admin/depts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[Deptmodal] 학과 생성 실패 raw body:", text);

      // JSON이면 message 뽑아보기
      try {
        const parsed = text ? JSON.parse(text) : null;
        const msg =
          parsed?.error?.message ||
          parsed?.message ||
          text ||
          `학과 생성 실패 (status: ${res.status})`;

        alert(msg); // 👈 이제 여기서 자세한 에러 메시지 뜰 거야
      } catch {
        alert(`학과 생성 실패 (status: ${res.status})\n${text}`);
      }

      return;
    }

    onClose();
  } catch (e) {
    console.error("[Deptmodal] 학과 생성 중 예외:", e);
    alert("학과 생성 중 알 수 없는 오류가 발생했습니다.");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
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
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleCreate}   // ✅ 여기!
            disabled={submitting}
          >
            {submitting ? "생성 중..." : "학과 생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
