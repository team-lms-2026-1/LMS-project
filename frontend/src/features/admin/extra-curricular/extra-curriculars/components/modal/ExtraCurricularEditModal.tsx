"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./ExtraCurricularEditModal.module.css";
import { useExtraCurricularEdit } from "../../hooks/useExtraCurricularMaster";
import { patchExtraCurricular } from "../../api/extraCurricularMasterApi";
import { useI18n } from "@/i18n/useI18n";

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
  const t = useI18n("extraCurricular.modal.programEdit");
  const tStatus = useI18n("extraCurricular.status.active");
  const tCommon = useI18n("extraCurricular.common");
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
      setSubmitError(e?.message ?? t("submitFailed"));
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
          <Button
            variant="primary"
            onClick={handlesubmit}
            loading={saving}
            disabled={disabled || saving}
          >
            {tCommon("saveButton")}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            {tCommon("closeButton")}
          </Button>
        </>
      }
    >
      {error && <div className={styles.error}>{error}</div>}
      {submitError && <div className={styles.error}>{submitError}</div>}

      <div className={styles.form}>
        {/* ✅ 비교과 코드 (수정 불가) */}
        <label className={styles.field}>
          <div className={styles.label}>{t("fields.programCode")}</div>
          <input
            className={styles.control}
            value={data?.extraCurricularCode ?? ""}
            disabled
          />
        </label>

        {/* ✅ 비교과명 */}
        <label className={styles.field}>
          <div className={styles.label}>{t("fields.programName")}</div>
          <input
            className={styles.control}
            value={extraCurricularName}
            disabled={disabled}
            onChange={(e) => setExtraCurricularName(e.target.value)}
          />
        </label>

        {/* ✅ 주관기관명 */}
        <label className={styles.field}>
          <div className={styles.label}>{t("fields.hostOrgName")}</div>
          <input
            className={styles.control}
            value={hostOrgName}
            disabled={disabled}
            onChange={(e) => setHostOrgName(e.target.value)}
          />
        </label>

        {/* ✅ 설명 */}
        <label className={styles.field}>
          <div className={styles.label}>{t("fields.description")}</div>
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
