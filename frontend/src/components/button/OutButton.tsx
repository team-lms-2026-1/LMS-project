"use client";

import * as React from "react";
import styles from "./OutButton.module.css";
import { useLocale } from "@/hooks/useLocale";
import { getOutButtonLoadingText } from "@/components/localeText";

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
  const { locale } = useLocale();
  const isDisabled = disabled || loading;
  const loadingText = getOutButtonLoadingText(locale);

  return (
    <button
      className={`${styles.outButton} ${className ?? ""}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
