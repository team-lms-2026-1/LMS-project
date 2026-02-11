"use client";

import * as React from "react";
import styles from "./ToggleSwitch.module.css";

export type ToggleSwitchProps = {
  /** 현재 값(제어 컴포넌트) */
  checked: boolean;
  /** 값 변경 */
  onChange: (checked: boolean) => void;

  disabled?: boolean;
  className?: string;
};

/**
 * Table Toggle Switch Component
 * Used in Account and Department list pages for status toggle
 */
export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleSwitchProps) {
  return (
    <label
      className={`${styles.switch} ${className || ""}`}
      aria-disabled={disabled}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.slider} />
    </label>
  );
}
