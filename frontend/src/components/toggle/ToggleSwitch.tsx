"use client";

import * as React from "react";
import styles from "./ToggleSwitch.module.css";

export type ToggleSwitchProps = {
  /** 현재 값(제어 컴포넌트) */
  checked: boolean;
  /** 값 변경 */
  onChange: (next: boolean) => void;

  disabled?: boolean;

  /** 표시 텍스트 커스터마이즈 */
  onLabel?: string;
  offLabel?: string;

  className?: string;
};

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  onLabel = "on",
  offLabel = "off",
  className,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cx(
        styles.switch,
        checked ? styles.on : styles.off,
        disabled && styles.disabled,
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span className={styles.label}>{checked ? onLabel : offLabel}</span>
      <span className={styles.knob} aria-hidden="true" />
    </button>
  );
}
