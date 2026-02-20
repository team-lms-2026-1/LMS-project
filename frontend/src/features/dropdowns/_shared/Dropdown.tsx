"use client";

import * as React from "react";
import styles from "./dropdown.module.css";
import { useLocale } from "@/hooks/useLocale";
import {
  getDropdownDefaultPlaceholder,
  getDropdownLoadingLabel,
} from "../localeLabel";

export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type DropdownProps = {
  value: string; // ""이면 선택 안됨
  options: DropdownOption[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  showPlaceholder?: boolean;

  onChange: (value: string) => void;
  onClear?: () => void;

  className?: string;
};

export function Dropdown({
  value,
  options,
  placeholder,
  loading = false,
  disabled = false,
  clearable = true,
  showPlaceholder = true,
  onChange,
  onClear,
  className,
}: DropdownProps) {
  const { locale } = useLocale();
  const isDisabled = disabled || loading;
  const resolvedPlaceholder = placeholder ?? getDropdownDefaultPlaceholder(locale);
  const loadingLabel = getDropdownLoadingLabel(locale);

  const selectedLabel =
    value === ""
      ? ""
      : options.find((o) => o.value === value)?.label ?? "";

  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      <label className={styles.srOnly}>{resolvedPlaceholder}</label>

      <div className={styles.control}>
        <select
          className={styles.select}
          value={value}
          disabled={isDisabled}
          onChange={(e) => onChange(e.target.value)}
          aria-busy={loading ? true : undefined}
        >
          {(showPlaceholder || loading) && (
            <option value="">{loading ? loadingLabel : resolvedPlaceholder}</option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
