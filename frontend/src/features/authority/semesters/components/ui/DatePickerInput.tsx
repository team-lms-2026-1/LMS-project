"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parseISO } from "date-fns";
import styles from "./DatePickerInput.module.css";

type Props = {
  value: string; // "yyyy-MM-dd" or ""
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string; // "yyyy-MM-dd"
  max?: string; // "yyyy-MM-dd"

  /** ✅ 부모(모달) 닫힐 때 popover 강제 닫기용 */
  closeSignal?: number;
};

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  try {
    return parseISO(value);
  } catch {
    return undefined;
  }
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "날짜 선택",
  disabled = false,
  min,
  max,
  closeSignal,
}: Props) {
  const [open, setOpen] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => toDate(value), [value]);
  const fromDate = useMemo(() => toDate(min ?? ""), [min]);
  const toDateMax = useMemo(() => toDate(max ?? ""), [max]);

  // ✅ 부모 신호로 강제 닫기 (모달 닫힐 때 충돌 방지)
  useEffect(() => {
    if (closeSignal === undefined) return;
    setOpen(false);
  }, [closeSignal]);

  // 바깥 클릭 닫기 (ref 기반)
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;

      if (btnRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;

      setOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const label = selected ? format(selected, "yyyy-MM-dd") : "";

  // ✅ fixed popover 좌표 (렌더 시점에 계산)
  const rect = btnRef.current?.getBoundingClientRect();
  const popStyle =
    open && rect
      ? ({
          position: "fixed",
          top: rect.bottom + 8,
          left: rect.left,
          zIndex: 2000,
        } as const)
      : undefined;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={styles.inputButton}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={label ? styles.text : styles.placeholder}>
          {label || placeholder}
        </span>
        <span className={styles.chev}>▾</span>
      </button>

      {open && rect ? (
        <div ref={popRef} className={styles.popover} style={popStyle}>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (!d) return;
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }}
            fromDate={fromDate}
            toDate={toDateMax}
          />
        </div>
      ) : null}
    </>
  );
}
