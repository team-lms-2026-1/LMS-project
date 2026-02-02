"use client";

import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "@/features/dropdowns/_shared";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal/Modal";
import { OfferingStatus } from "@/features/curricular-offering/api/types";
import { updateCurricularOfferingStatus } from "@/features/curricular-offering/api/curricularOfferingsApi";
import styles from "./OfferingStatusDropdown.module.css";

type Props = {
  offeringId: number;
  status: OfferingStatus;
  onChanged?: () => void | Promise<void>;
  disabled?: boolean;
};

const OPTIONS = [
  { value: "DRAFT", label: "작성중" },
  { value: "OPEN", label: "등록열림" },
  { value: "ENROLLMENT_CLOSED", label: "등록마감" },
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료(성적확정)" },
  { value: "CANCELED", label: "취소" },
];


export function OfferingStatusDropdown({ offeringId, status, onChanged, disabled = false }: Props) {
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
      setSubmitError(e?.message ?? "상태변경에 실패했습니다.");

      // UI는 원복(서버 상태로)
      setValue(status);
      setPending(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dropdown
        value={value}
        options={OPTIONS}
        disabled={disabled || saving}
        onChange={handleSelect}
      />

      <Modal
        open={confirmOpen}
        title="상태 변경"
        onClose={saving ? () => {} : handleCancel}
        size="sm"
        footer={
          <>
            <Button onClick={handleConfirm} loading={saving}>
              예
            </Button>
            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
              아니오
            </Button>
          </>
        }
      >
      {submitError && <div className={styles.error}>{submitError}</div>}
        <div>
          <div style={{ marginBottom: 8 }}>
            상태를변경하시겠습니까? (상태는 되돌릴 수 없습니다.)
          </div>
        </div>
      </Modal>
    </>
  );
}
