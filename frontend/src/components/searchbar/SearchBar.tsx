"use client";

import * as React from "react";
import styles from "./SearchBar.module.css";

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
  placeholder = "검색어를 입력하세요",
  disabled = false,
  loading = false,
  searchOnEnter = true,
  allowEmptySearch = true,
  showClear = true,
  onClear,
  inputId,
  inputName,
  ariaLabel = "검색어",
  className,
}: SearchBarProps) {
  const isDisabled = Boolean(disabled || loading);
  const canSearch = allowEmptySearch ? true : value.trim().length > 0;

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
        {ariaLabel}
      </label>

      <div className={styles.inputRow}>
        <input
          id={inputId}
          name={inputName}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
        />

        {showClear && value.length > 0 ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            disabled={isDisabled}
            aria-label="검색어 지우기"
            title="지우기"
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
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {!allowEmptySearch && value.trim().length === 0 ? (
        <div className={styles.hint}>검색어를 입력해주세요.</div>
      ) : null}
    </form>
  );
}
