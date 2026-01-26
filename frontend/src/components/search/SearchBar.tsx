"use client";

import * as React from "react";
import styles from "./SearchBar.module.css";

export type SearchFilterOption = {
  value: string;
  label: string;
};

export type SearchBarProps = {
  /** 초기값(보통 URL에서 받아서 전달) */
  keyword: string;
  filter: string;

  /** 필터 옵션 */
  filterOptions: SearchFilterOption[];

  /** 검색 실행(Enter/버튼 클릭) */
  onSearch: (keyword: string, filter: string) => void;

  /** placeholder */
  placeholder?: string;

  /** 검색 버튼 라벨 */
  searchLabel?: string;

  /** 필터 라벨(접근성) */
  filterAriaLabel?: string;

  /** disabled */
  disabled?: boolean;

  className?: string;
};

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

export function SearchBar({
  keyword,
  filter,
  filterOptions,
  onSearch,
  placeholder = "검색어를 입력하세요",
  searchLabel = "검색",
  filterAriaLabel = "검색 필터",
  disabled = false,
  className,
}: SearchBarProps) {
  const [localKeyword, setLocalKeyword] = React.useState(keyword);
  const [localFilter, setLocalFilter] = React.useState(filter);

  // URL 변경 등 외부 값이 바뀌면 로컬도 동기화
  React.useEffect(() => setLocalKeyword(keyword), [keyword]);
  React.useEffect(() => setLocalFilter(filter), [filter]);

  const submit = () => {
    if (disabled) return;
    onSearch(localKeyword, localFilter);
  };

  return (
    <div className={cx(styles.wrap, className)}>
      <select
        className={styles.select}
        value={localFilter}
        onChange={(e) => setLocalFilter(e.target.value)}
        aria-label={filterAriaLabel}
        disabled={disabled}
      >
        {filterOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        className={styles.input}
        value={localKeyword}
        onChange={(e) => setLocalKeyword(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      <button
        type="button"
        className={styles.searchBtn}
        onClick={submit}
        disabled={disabled}
      >
        {searchLabel}
      </button>
    </div>
  );
}
