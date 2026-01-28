"use client";

import * as React from "react";
import styles from "./OutButton.module.css";

export type OutButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
  };

export function OutButton({
  children,
  className,
  loading = false,
  disabled,
  ...props
}: OutButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${styles.outButton} ${className ?? ""}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? "처리중..." : children}
    </button>
  );
}
