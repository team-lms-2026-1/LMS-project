"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import { cn } from "@/components/ui/table"; // 이미 cn을 table utils에서 export 중이면 사용

type ModalSize = "sm" | "md" | "lg";

export function Modal({
  open,
  title,
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEsc = true,
  lockScroll = true,
  size = "md",
  footer,
  headerRight,
}: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  lockScroll?: boolean;
  size?: ModalSize;
  footer?: React.ReactNode;       // 하단 버튼 영역
  headerRight?: React.ReactNode;  // 헤더 우측 커스텀(선택)
}) {
  const labelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  // ✅ ESC 닫기 + 포커스 관리
  useEffect(() => {
    if (!open) return;

    prevActiveRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!closeOnEsc) return;
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    // ✅ 모달 열리면 패널에 포커스
    setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      // ✅ 닫히면 원래 포커스로 복귀
      prevActiveRef.current?.focus?.();
    };
  }, [open, closeOnEsc, onClose]);

  // ✅ body scroll lock
  useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  if (!open) return null;

  const panelSizeClass =
    size === "sm" ? styles.panelSm : size === "lg" ? styles.panelLg : "";

  const content = (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        // ✅ backdrop 자체 클릭만 닫기 (패널 내부 클릭은 무시)
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={cn(styles.panel, panelSizeClass)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelId : undefined}
        tabIndex={-1}
        ref={panelRef}
      >
        {(title || headerRight) && (
          <div className={styles.header}>
            <h2 id={labelId} className={styles.title}>
              {title}
            </h2>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {headerRight}
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="close"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );

  // ✅ Portal (Next.js에서 레이어/overflow 문제 방지)
  return createPortal(content, document.body);
}
