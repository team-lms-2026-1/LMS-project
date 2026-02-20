"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "./Button";
import { useLocale } from "@/hooks/useLocale";
import {
  getDeleteDefaultConfirmMessage,
  getDeleteDefaultLabel,
  getDeleteFailedMessage,
} from "@/components/localeText";

export type DeleteActionButtonProps = Omit<ButtonProps, "variant" | "onClick" | "children"> & {
  /** 실제 삭제 로직(필수): API 호출 등을 여기서 수행 */
  onDelete: () => Promise<void>;

  /** confirm 문구 (빈 문자열/undefined면 confirm 없이 바로 수행) */
  confirmMessage?: string;

  /** 버튼 라벨 */
  label?: string;

  /** 삭제 성공 후 실행할 동작 (예: 목록 reload, 상태 업데이트 등) */
  onDeleted?: () => void;

  /** 삭제 성공 후 router.refresh() 수행 여부 (기본 true) */
  refreshOnSuccess?: boolean;

  /** 삭제 실패 시 사용자 메시지(기본 alert). 커스텀 처리 가능 */
  onError?: (error: unknown) => void;
};

export function DeleteActionButton({
  onDelete,
  confirmMessage,
  label,
  onDeleted,
  refreshOnSuccess = true,
  onError,
  disabled,
  ...props
}: DeleteActionButtonProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [loading, setLoading] = React.useState(false);
  const resolvedConfirmMessage = confirmMessage ?? getDeleteDefaultConfirmMessage(locale);
  const resolvedLabel = label ?? getDeleteDefaultLabel(locale);
  const failedMessage = getDeleteFailedMessage(locale);

  const handleClick = async () => {
    if (loading) return;

    if (resolvedConfirmMessage && resolvedConfirmMessage.trim().length > 0) {
      const ok = window.confirm(resolvedConfirmMessage);
      if (!ok) return;
    }

    try {
      setLoading(true);
      await onDelete();

      if (onDeleted) onDeleted();
      if (refreshOnSuccess) router.refresh();
    } catch (e) {
      if (onError) {
        onError(e);
      } else {
        // 프로젝트에 toast가 없다는 가정 하에 기본 alert
        alert(failedMessage);
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="danger"
      loading={loading}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {resolvedLabel}
    </Button>
  );
}
