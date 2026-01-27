"use client";

import styles from "./SemestersSearchBar.module.css";

export function SemestersSearchBar({
  keyword,
  onChangeKeyword,
  onSearch,
}: {
  keyword: string;
  onChangeKeyword: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className={styles.searchRow}>
      <input
        type="text"
        placeholder="검색어 입력..."
        className={styles.searchInput}
        value={keyword}
        onChange={(e) => onChangeKeyword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
      />
      <button className={styles.searchButton} type="button" onClick={onSearch}>
        검색
      </button>
    </div>
  );
}
