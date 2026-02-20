"use client";

import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "@/features/dropdowns/_shared";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal/Modal";
import { OfferingStatus } from "@/features/curricular-offering/api/types";
import { updateCurricularOfferingStatus } from "@/features/curricular-offering/api/curricularOfferingsApi";
import styles from "./OfferingStatusDropdown.module.css";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  offeringId: number;
  status: OfferingStatus;
  onChanged?: () => void | Promise<void>;
  disabled?: boolean;
};

export function OfferingStatusDropdown({ offeringId, status, onChanged, disabled = false }: Props) {
  const t = useI18n("curricular.adminOfferingDetail.status");
  const tStatus = useI18n("curricular.status.offering");

  const [value, setValue] = useState<OfferingStatus>(status);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<OfferingStatus | null>(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setValue(status);
    setPending(null);
    setConfirmOpen(false);
    setSubmitError(null);
  }, [status]);

  const handleSelect = (next: string) => {
    const nextStatus = next as OfferingStatus;
    if (nextStatus === status) return;

    setValue(nextStatus);
    setPending(nextStatus);
    setSubmitError(null);
    setConfirmOpen(true);
  };

  const handleCancel = () => {
    setValue(status);
    setPending(null);
    setConfirmOpen(false);
    setSubmitError(null);
  };

  const handleConfirm = async () => {
    if (!pending) return;

    setSaving(true);
    setSubmitError(null);

    try {
      await updateCurricularOfferingStatus(offeringId, { status: pending });

      // 성공
      setConfirmOpen(false);
      setPending(null);
      setSubmitError(null);
      await onChanged?.();
    } catch (e: any) {
      setSubmitError(e?.message ?? t("messages.updateFailed"));

      // UI는 원복(서버 상태로)
      setValue(status);
      setPending(null);
    } finally {
      setSaving(false);
    }
  };

  const options = useMemo(
    () => [
      { value: "DRAFT", label: tStatus("DRAFT") },
      { value: "OPEN", label: tStatus("OPEN") },
      { value: "ENROLLMENT_CLOSED", label: tStatus("ENROLLMENT_CLOSED") },
      { value: "IN_PROGRESS", label: tStatus("IN_PROGRESS") },
      { value: "COMPLETED", label: tStatus("COMPLETED") },
      { value: "CANCELED", label: tStatus("CANCELED") },
    ],
    [tStatus]
  );

  return (
    <>
      <Dropdown
        value={value}
        options={options}
        disabled={disabled || saving}
        onChange={handleSelect}
      />

      <Modal
        open={confirmOpen}
        title={t("title")}
        onClose={saving ? () => {} : handleCancel}
        size="sm"
        footer={
          <>
            <Button onClick={handleConfirm} loading={saving}>
              {t("confirmYes")}
            </Button>
            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
              {t("confirmNo")}
            </Button>
          </>
        }
      >
      {submitError && <div className={styles.error}>{submitError}</div>}
        <div>
          <div style={{ marginBottom: 8 }}>
            {t("messages.confirmText")}
          </div>
        </div>
      </Modal>
    </>
  );
}
