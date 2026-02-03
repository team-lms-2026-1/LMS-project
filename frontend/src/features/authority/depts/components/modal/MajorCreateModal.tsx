"use client";

import { useState } from "react";
import styles from "./MajorCreateModal.module.css";

import { Modal } from "@/components/modal";
import { Button } from "@/components/button";
import { ToggleSwitch } from "@/components/toggle";
import { getJson } from "@/lib/http";

type Props = {
  deptId: string;
  onClose: () => void;
  onCreated?: () => void;
};

export default function MajorCreateModal({
  deptId,
  onClose,
  onCreated,
}: Props) {
  const [majorName, setMajorName] = useState("");
  const [majorCode, setMajorCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!majorName.trim()) {
      alert("전공이름을 입력해주세요.");
      return;
    }
    if (!majorCode.trim()) {
      alert("전공코드를 입력해주세요.");
      return;
    }

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

      // 부모에게 "생성됨" 알리기
      onCreated?.();
      onClose();
    } catch (error) {
      console.error("[MajorCreateModal] error:", error);
      alert("전공 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <div className={styles.modal}>
        <h2 className={styles.title}>전공 추가</h2>

        <div className={styles.field}>
          <label className={styles.label}>전공이름</label>
          <input
            className={styles.input}
            value={majorName}
            onChange={(e) => setMajorName(e.target.value)}
            placeholder="예) 소프트웨어공학"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>전공코드</label>
          <input
            className={styles.input}
            value={majorCode}
            onChange={(e) => setMajorCode(e.target.value)}
            placeholder="예) SWENG"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>상태</label>
          <div className={styles.toggleRow}>
            <ToggleSwitch checked={isActive} onChange={setIsActive} />
            <span className={styles.toggleText}>
              {isActive ? "활성화" : "비활성화"}
            </span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>설명</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="전공에 대한 설명을 입력하세요."
            rows={6}
          />
        </div>

        <div className={styles.footer}>
          <Button
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            전공 생성
          </Button>
        </div>
      </div>
    </Modal>
  );
}
