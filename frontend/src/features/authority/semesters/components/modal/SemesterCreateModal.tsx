"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";

export function SemesterCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      // TODO: API 호출
      await onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="학기 등록"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving}>
            취소
          </button>
          <button type="button" onClick={submit} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </>
      }
    >
      {/* 폼 내용 */}
      <div>여기에 폼</div>
    </Modal>
  );
}
