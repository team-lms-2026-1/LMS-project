"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./CurricularCreateModal.module.css";

import { createCurricular } from "../../api/curricularsApi";
import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";


type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function CurricularCreateModal({ open, onClose, onCreated }: Props) {

  const [curricularCode, setCurricularCode] = useState<string>("");
  const [curricularName, setCurricularName] = useState<string>("");
  const [deptId, setDeptId] = useState<number>(0);
  const [credits, setCredits] = useState<number>(0);
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const resetAll = () => {
    setCurricularCode("");
    setCurricularName("");
    setDeptId(0);
    setCredits(0);
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose();
  };

  const validate = () => {
    if (!curricularCode.trim()) return "교과코드를 입력하세요.";
    if (!curricularName.trim()) return "교과이름을 입력하세요.";
    if (deptId <= 0) return "주관학과를 선택하세요.";
    if (credits <= 0) return "부여 학점을 입력하세요.";
    if (!description.trim()) return "교과 설명을 입력하세요.";
    return null;
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createCurricular({ curricularCode, curricularName, deptId, credits, description });
      await onCreated();

      resetAll();
      onClose();
    } catch (e: any) {
      setError(e?.error?.message ?? e?.message ?? "등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="교과 등록"
      onClose={handleClose}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            등록
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 교과코드 / 교과명 / 주관학과 / 학점 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>교과코드</div>
            <input
              className={styles.control}
              value={curricularCode}
              onChange={(e) => setCurricularCode(e.target.value)}
              placeholder="예) CS101"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>교과명</div>
            <input
              className={styles.control}
              value={curricularName}
              onChange={(e) => setCurricularName(e.target.value)}
              placeholder="예) 자료구조"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>주관학과</div>
              <DeptFilterDropdown
                value={deptId > 0 ? String(deptId) : ""}
                onChange={(v) => setDeptId(v ? Number(v) : 0)}
              />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>학점</div>
            <input
              className={styles.control}
              type="number"
              value={credits === 0 ? "" : credits}
              onChange={(e) => {
                const v = e.target.value;
                setCredits(v === "" ? 0 : Number(v));
              }}
              placeholder="예) 3"
              min={1}
              max={30}
            />
          </label>
        </div>

        {/* ✅ 설명: 전체 폭 */}
        <label className={styles.field}>
          <div className={styles.label}>설명</div>
          <textarea
            className={styles.control}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="교과 설명을 입력하세요."
            rows={4}
          />
        </label>
      </div>
    </Modal>
  );
}