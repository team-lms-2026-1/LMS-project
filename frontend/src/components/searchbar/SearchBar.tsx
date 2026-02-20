"use client";

import * as React from "react";
import styles from "./SearchBar.module.css";
import { useLocale } from "@/hooks/useLocale";
import {
  getSearchAriaLabel,
  getSearchButtonText,
  getSearchClearAriaLabel,
  getSearchClearTitle,
  getSearchEmptyHint,
  getSearchLoadingText,
  getSearchPlaceholder,
} from "@/components/localeText";

export type SearchBarProps = {
  value: string;
  onChange: (next: string) => void;
  onSearch: () => void;

  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;

  /** Enter로 검색 트리거 (default: true) */
  searchOnEnter?: boolean;

  /** 비워져 있을 때도 검색 버튼 활성화 (default: true) */
  allowEmptySearch?: boolean;

  /** value가 있을 때 X 버튼 노출 (default: true) */
  showClear?: boolean;
  onClear?: () => void;

  /** 접근성/테스트용 */
  inputId?: string;
  inputName?: string;
  ariaLabel?: string;

  /** className 확장 */
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  loading = false,
  searchOnEnter = true,
  allowEmptySearch = true,
  showClear = true,
  onClear,
  inputId,
  inputName,
  ariaLabel,
  className,
}: SearchBarProps) {
  const { locale } = useLocale();
  const isDisabled = Boolean(disabled || loading);
  const canSearch = allowEmptySearch ? true : value.trim().length > 0;
  const resolvedPlaceholder = placeholder ?? getSearchPlaceholder(locale);
  const resolvedAriaLabel = ariaLabel ?? getSearchAriaLabel(locale);
  const clearAriaLabel = getSearchClearAriaLabel(locale);
  const clearTitle = getSearchClearTitle(locale);
  const searchText = getSearchButtonText(locale);
  const searchingText = getSearchLoadingText(locale);
  const emptyHint = getSearchEmptyHint(locale);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDisabled) return;
    if (!canSearch) return;
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOnEnter) return;
    if (e.key !== "Enter") return;
    // form submit로도 처리되지만, IME 조합 이슈 방지 겸 안전망
    if ((e.nativeEvent as any).isComposing) return;
  };

  const handleClear = () => {
    if (isDisabled) return;
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <form className={[styles.wrap, className].filter(Boolean).join(" ")} onSubmit={handleSubmit}>
      <label className={styles.srOnly} htmlFor={inputId}>
        {resolvedAriaLabel}
      </label>

      <div className={styles.inputRow}>
        <input
          id={inputId}
          name={inputName}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={resolvedPlaceholder}
          disabled={isDisabled}
          onKeyDown={handleKeyDown}
          aria-label={resolvedAriaLabel}
        />

        {showClear && value.length > 0 ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            disabled={isDisabled}
            aria-label={clearAriaLabel}
            title={clearTitle}
          >
            ×
          </button>
        ) : null}

        <button
          type="submit"
          className={styles.searchBtn}
          disabled={isDisabled || !canSearch}
          aria-busy={loading ? true : undefined}
        >
          {loading ? searchingText : searchText}
        </button>
      </div>

      {!allowEmptySearch && value.trim().length === 0 ? (
        <div className={styles.hint}>{emptyHint}</div>
      ) : null}
    </form>
  );
}
