"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./ExtraCurricularCreateModal.module.css"
import { createExtraCurricular } from "../../api/extraCurricularMasterApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function ExtraCurricularCreateModal({ open, onClose, onCreated }: Props) {

  const [extraCurricularCode, setExtraCurricularCode] = useState<string>("");
  const [extraCurricularName, setExtraCurricularName] = useState<string>("");
  const [hostOrgName, setHostOrgName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const resetAll = () => {
    setExtraCurricularCode("");
    setExtraCurricularName("");
    setHostOrgName("");
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose();
  };

  const validate = () => {
    if (!extraCurricularCode.trim()) return "교과코드를 입력하세요.";
    if (!extraCurricularName.trim()) return "교과이름을 입력하세요.";
    if (!hostOrgName.trim()) return "주관기관명을 입력하세요.";
    if (!description.trim()) return "비교과 설명을 입력하세요.";
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
      await createExtraCurricular({ extraCurricularCode, extraCurricularName, hostOrgName, description });
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
      title="비교과 등록"
      onClose={handleClose}
      size="md"
      footer={
        <>
          <Button onClick={handleSubmit} loading={loading}>
            등록
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2열: 비교과 코드 / 비교과명 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>비교과 코드</div>
            <input
              className={styles.control}
              value={extraCurricularCode}
              onChange={(e) => setExtraCurricularCode(e.target.value)}
              placeholder="예) EX001"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>비교과명</div>
            <input
              className={styles.control}
              value={extraCurricularName}
              onChange={(e) => setExtraCurricularName(e.target.value)}
              placeholder="예) 창업 특강"
              autoComplete="off"
            />
          </label>
        </div>

        {/* ✅ 주관기관 */}
        <label className={styles.field}>
          <div className={styles.label}>주관기관명</div>
          <input
            className={styles.control}
            value={hostOrgName}
            onChange={(e) => setHostOrgName(e.target.value)}
            placeholder="예) 산학협력단"
            autoComplete="off"
          />
        </label>

        {/* ✅ 설명 */}
        <label className={styles.field}>
          <div className={styles.label}>설명</div>
          <textarea
            className={styles.control}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="비교과 프로그램 설명을 입력하세요."
            rows={4}
          />
        </label>
      </div>
    </Modal>
  );

}