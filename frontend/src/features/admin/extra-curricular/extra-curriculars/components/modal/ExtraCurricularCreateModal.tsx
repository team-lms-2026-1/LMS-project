"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./ExtraCurricularCreateModal.module.css"
import { createExtraCurricular } from "../../api/extraCurricularMasterApi";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function ExtraCurricularCreateModal({ open, onClose, onCreated }: Props) {
  const t = useI18n("extraCurricular.modal.programCreate");
  const tCommon = useI18n("extraCurricular.common");

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
    if (!extraCurricularCode.trim()) return t("validation.requiredProgramCode");
    if (!extraCurricularName.trim()) return t("validation.requiredProgramName");
    if (!hostOrgName.trim()) return t("validation.requiredHostOrgName");
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
      await createExtraCurricular({ extraCurricularCode, extraCurricularName, hostOrgName, description });
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
        {/* ✅ 2열: 비교과 코드 / 비교과명 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.programCode")}</div>
            <input
              className={styles.control}
              value={extraCurricularCode}
              onChange={(e) => setExtraCurricularCode(e.target.value)}
              placeholder={t("placeholders.programCode")}
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.programName")}</div>
            <input
              className={styles.control}
              value={extraCurricularName}
              onChange={(e) => setExtraCurricularName(e.target.value)}
              placeholder={t("placeholders.programName")}
              autoComplete="off"
            />
          </label>
        </div>

        {/* ✅ 주관기관 */}
        <label className={styles.field}>
          <div className={styles.label}>{t("fields.hostOrgName")}</div>
          <input
            className={styles.control}
            value={hostOrgName}
            onChange={(e) => setHostOrgName(e.target.value)}
            placeholder={t("placeholders.hostOrgName")}
            autoComplete="off"
          />
        </label>

        {/* ✅ 설명 */}
        <label className={styles.field}>
          <div className={styles.label}>{t("fields.description")}</div>
          <textarea
            className={styles.control}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("placeholders.description")}
            rows={4}
          />
        </label>
      </div>
    </Modal>
  );

}
