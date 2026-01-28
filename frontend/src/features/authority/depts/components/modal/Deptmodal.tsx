// 위치: frontend/src/features/authority/depts/components/modal/Deptmodal.tsx
"use client";

import { useState } from "react";
import styles from "@/features/authority/depts/styles/DeptCreate.module.css";

// 버튼 공용 컴포넌트 (상대 경로 기준)
import { Button } from "@/components/button";
import { OutButton } from "@/components/button/OutButton";

type DeptmodalProps = {
  onClose: () => void;
};

export default function Deptmodal({ onClose }: DeptmodalProps) {
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!deptCode.trim() || !deptName.trim()) {
      alert("학과코드와 학과이름은 필수입니다.");
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);

      const payload = {
        deptCode: deptCode.trim(),
        deptName: deptName.trim(),
        description: description.trim() || null,
        isActive: true, // 기본 활성화
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

        try {
          const parsed = text ? JSON.parse(text) : null;
          const msg =
            parsed?.error?.message ||
            parsed?.message ||
            text ||
            `학과 생성 실패 (status: ${res.status})`;

          alert(msg);
        } catch {
          alert(`학과 생성 실패 (status: ${res.status})`);
        }

        return;
      }

      // ✅ 정상 생성되면 모달 닫기
      onClose();
    } catch (e) {
      console.error("[Deptmodal] 학과 생성 중 예외:", e);
      alert("학과 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={submitting ? undefined : onClose} // 처리 중에는 바깥 클릭 무시
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
            disabled={submitting}
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
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>학과이름</label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className={styles.input}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              disabled={submitting}
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          <OutButton
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </OutButton>

          <Button
            type="button"
            variant="primary"
            className={styles.secondaryButton}
            onClick={handleCreate}
            loading={submitting}
            disabled={submitting}
          >
            학과 생성
          </Button>
        </div>
      </div>
    </div>
  );
}
