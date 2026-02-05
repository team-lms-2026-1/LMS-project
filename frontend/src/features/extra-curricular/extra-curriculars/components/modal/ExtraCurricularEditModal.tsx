"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./ExtraCurricularEditModal.module.css";
import { useExtraCurricularEdit } from "../../hooks/useExtraCurricularMaster";
import { patchExtraCurricular } from "../../api/extraCurricularMasterApi";

type Props = {
  open: boolean;
  extraCurricularId?: number;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

export function ExtraCurricularEditModal({
  open,
  extraCurricularId,
  onClose,
  onUpdated
}: Props) {
  const { state } = useExtraCurricularEdit(extraCurricularId, open);
  const { data, loading, error } = state;

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [extraCurricularName, setExtraCurricularName] = useState("");
  const [description, setDescription] = useState("");
  const [hostOrgName, setHostOrgName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handlesubmit = async () => {
    if(!extraCurricularId) return;

    setSaving(true);
    setSubmitError(null);

    try {
      await patchExtraCurricular( extraCurricularId, {
        extraCurricularName,
        description,
        hostOrgName,
        isActive,
      });

      await onUpdated(); // reload 추가

      onClose();
    } catch (e: any) {
      setSubmitError(e?.message ?? "비교과 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!open) return;

    // 신규/ID 없음 → 초기화
    if (!extraCurricularId) {
      setExtraCurricularName("");
      setHostOrgName("");
      setDescription("");
      setIsActive(true);
      setSubmitError(null);
      return;
    }

    // 아직 데이터 로딩 전
    if (!data) return;

    // 수정 데이터 바인딩
    setExtraCurricularName(data.extraCurricularName);
    setHostOrgName(data.hostOrgName);
    setDescription(data.description);
    setIsActive(data.isActive);
    setSubmitError(null);
  }, [open, extraCurricularId, data]);

  const handleClose = () => {
    onClose();
  };

  const disabled = loading || !data;

  return (
    <Modal
      open={open}
      title="비교과 수정"
      onClose={handleClose}
      size="md"
      headerRight={
        <label className={styles.headerToggle} aria-disabled={disabled}>
          <span className={styles.headerToggleLabel}>
            {isActive ? "활성" : "비활성"}
          </span>

          <input
            type="checkbox"
            className={styles.headerToggleInput}
            checked={isActive}
            disabled={disabled}
            onChange={(e) => setIsActive(e.target.checked)}
            aria-label="활성 여부"
          />

          <span className={styles.headerToggleTrack} aria-hidden="true">
            <span className={styles.headerToggleThumb} />
          </span>
        </label>
      }
      footer={
        <>
          <Button
            variant="primary"
            onClick={handlesubmit}
            loading={saving}
            disabled={disabled || saving}
          >
            저장
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            닫기
          </Button>
        </>
      }
    >
      {error && <div className={styles.error}>{error}</div>}
      {submitError && <div className={styles.error}>{submitError}</div>}

      <div className={styles.form}>
        {/* ✅ 비교과 코드 (수정 불가) */}
        <label className={styles.field}>
          <div className={styles.label}>비교과 코드</div>
          <input
            className={styles.control}
            value={data?.extraCurricularCode ?? ""}
            disabled
          />
        </label>

        {/* ✅ 비교과명 */}
        <label className={styles.field}>
          <div className={styles.label}>비교과명</div>
          <input
            className={styles.control}
            value={extraCurricularName}
            disabled={disabled}
            onChange={(e) => setExtraCurricularName(e.target.value)}
          />
        </label>

        {/* ✅ 주관기관명 */}
        <label className={styles.field}>
          <div className={styles.label}>주관기관명</div>
          <input
            className={styles.control}
            value={hostOrgName}
            disabled={disabled}
            onChange={(e) => setHostOrgName(e.target.value)}
          />
        </label>

        {/* ✅ 설명 */}
        <label className={styles.field}>
          <div className={styles.label}>설명</div>
          <textarea
            className={styles.control}
            value={description}
            disabled={disabled}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </label>
      </div>
    </Modal>
  );

}
