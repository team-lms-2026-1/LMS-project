"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./CurricularCreateModal.module.css";

import { createCurricular } from "../../api/curricularsApi";
import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { useI18n } from "@/i18n/useI18n";


type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function CurricularCreateModal({ open, onClose, onCreated }: Props) {
  const t = useI18n("curricular.modal.curricularCreate");
  const tCommon = useI18n("curricular.common");

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
    if (!curricularCode.trim()) return t("validation.requiredCurricularCode");
    if (!curricularName.trim()) return t("validation.requiredCurricularName");
    if (deptId <= 0) return t("validation.requiredDept");
    if (credits <= 0) return t("validation.requiredCredits");
    if (!description.trim()) return t("validation.requiredDescription");
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
      setError(e?.error?.message ?? e?.message ?? t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={handleClose}
      size="md"
      footer={
        <>
          <Button onClick={handleSubmit} loading={loading}>
            {tCommon("registerButton")}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {tCommon("cancelButton")}
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.form}>
        {/* ✅ 2×2: 교과코드 / 교과명 / 주관학과 / 학점 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("curricularCodeLabel")}</div>
            <input
              className={styles.control}
              value={curricularCode}
              onChange={(e) => setCurricularCode(e.target.value)}
              placeholder={t("curricularCodePlaceholder")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("curricularNameLabel")}</div>
            <input
              className={styles.control}
              value={curricularName}
              onChange={(e) => setCurricularName(e.target.value)}
              placeholder={t("curricularNamePlaceholder")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("deptLabel")}</div>
              <DeptFilterDropdown
                value={deptId > 0 ? String(deptId) : ""}
                onChange={(v) => setDeptId(v ? Number(v) : 0)}
              />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("creditsLabel")}</div>
            <input
              className={styles.control}
              type="number"
              value={credits === 0 ? "" : credits}
              onChange={(e) => {
                const v = e.target.value;
                setCredits(v === "" ? 0 : Number(v));
              }}
              placeholder={t("creditsPlaceholder")}
              min={1}
              max={30}
            />
          </label>
        </div>

        {/* ✅ 설명: 전체 폭 */}
        <label className={styles.field}>
          <div className={styles.label}>{t("descriptionLabel")}</div>
          <textarea
            className={styles.control}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={4}
          />
        </label>
      </div>
    </Modal>
  );
}
