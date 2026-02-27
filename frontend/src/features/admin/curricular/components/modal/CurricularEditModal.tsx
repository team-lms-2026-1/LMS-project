"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./CurricularEditModal.module.css";

import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { useCurricularEdit } from "../../hooks/useCurricularList";
import { patchCurricular } from "../../api/curricularsApi";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  open: boolean;
  curricularId?: number;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

export function CurricularEditModal({
  open,
  curricularId,
  onClose,
  onUpdated
}: Props) {
  const t = useI18n("curricular.modal.curricularEdit");
  const tStatus = useI18n("curricular.status.active");
  const tCommon = useI18n("curricular.common");
  const { state } = useCurricularEdit(curricularId, open);
  const { data, loading, error } = state;

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [curricularCode, setCurricularCode] = useState("");
  const [curricularName, setCurricularName] = useState("");
  const [deptId, setDeptId] = useState<number>(0);
  const [credits, setCredits] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handlesubmit = async () => {
    if(!curricularId) return;

    setSaving(true);
    setSubmitError(null);

    try {
      await patchCurricular( curricularId, {
        curricularName,
        deptId,
        credits,
        description,
        isActive,
      });

      await onUpdated(); // reload 추가

      onClose();
    } catch (e: any) {
      setSubmitError(e?.message ?? t("submitFailed"));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!open) return;

    if (!curricularId) {
      setCurricularCode("");
      setCurricularName("");
      setDeptId(0);
      setCredits(0);
      setDescription("");
      setIsActive(true);
      return;
    }

    if (!data) return;

    setCurricularCode(data.curricularCode);
    setCurricularName(data.curricularName);
    setDeptId(data.deptId);
    setCredits(data.credits);
    setDescription(data.description);
    setIsActive(data.isActive);
  }, [open, curricularId, data]);

  const handleClose = () => {
    onClose();
  };

  const disabled = loading || !data;

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={handleClose}
      size="md"
      headerRight={
        <label className={styles.headerToggle} aria-disabled={disabled}>
          <span className={styles.headerToggleLabel}>
            {isActive ? tStatus("ACTIVE") : tStatus("INACTIVE")}
          </span>

          <input
            type="checkbox"
            className={styles.headerToggleInput}
            checked={isActive}
            disabled={disabled}
            onChange={(e) => setIsActive(e.target.checked)}
            aria-label={t("activeAriaLabel")}
          />

          <span className={styles.headerToggleTrack} aria-hidden="true">
            <span className={styles.headerToggleThumb} />
          </span>
        </label>
      }

      footer={
        <>
          <Button variant="primary" onClick={handlesubmit} loading={saving} disabled={disabled || saving} >
            {tCommon("saveButton")}
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            {tCommon("closeButton")}
          </Button>
        </>
      }
    >
      {error && <div className={styles.error}>{error}</div>}
      {submitError && <div className={styles.error}>{submitError}</div>}

      <div className={styles.form}>
        <div className={styles.grid2}>
          {/* 교과목 코드 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("curricularCodeLabel")}</div>
            <input
              className={styles.control}
              value={curricularCode}
              disabled
            />
          </label>

          {/* 교과목명 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("curricularNameLabel")}</div>
            <input
              className={styles.control}
              value={curricularName}
              disabled={disabled}
              onChange={(e) => setCurricularName(e.target.value)}
            />
          </label>

          {/* 학과 ID */}
          <label className={styles.field}>
            <div className={styles.label}>{t("deptLabel")}</div>
            <DeptFilterDropdown
              value={deptId > 0 ? String(deptId) : ""}
              onChange={(v) => setDeptId(v ? Number(v) : 0)}
            />
          </label>

          {/* 학점 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("creditsLabel")}</div>
            <input
              type="number"
              className={styles.control}
              value={credits}
              disabled={disabled}
              onChange={(e) => setCredits(Number(e.target.value))}
            />
          </label>
        </div>
          {/* 설명 */}
          <label className={styles.field}>
            <div className={styles.label}>{t("descriptionLabel")}</div>
            <textarea
              className={styles.control}
              value={description}
              disabled={disabled}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
      </div>
    </Modal>
  );
}
