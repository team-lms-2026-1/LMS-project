"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import { cn } from "@/components/table";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  lockScroll?: boolean;
  size?: ModalSize;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
};

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
}: ModalProps) {
  const labelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  // ✅ onClose 참조를 안정화 (deps로 넣지 않아도 최신 함수 호출 가능)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // ✅ ESC 닫기 + 포커스 관리 (열릴 때 1회만 포커스 잡기)
  useEffect(() => {
    if (!open) return;

    prevActiveRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!closeOnEsc) return;
      if (e.key === "Escape") onCloseRef.current();
    };

    window.addEventListener("keydown", onKeyDown);

    // ✅ 열릴 때: data-autofocus > 첫 폼컨트롤 > panel 순서로 포커스
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;

      const autofocusEl =
        panel.querySelector<HTMLElement>("[data-autofocus]") ??
        panel.querySelector<HTMLElement>(
          'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
        );

      (autofocusEl ?? panel).focus();
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      prevActiveRef.current?.focus?.();
    };
  }, [open, closeOnEsc]);

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
        if (e.target === e.currentTarget) onCloseRef.current();
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
                onClick={() => onCloseRef.current()}
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

  return createPortal(content, document.body);
}
