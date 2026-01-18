"use client";

import styles from "../../styles/DepartmentListPage.module.css";

type Props = {
  keyword: string;
  onChangeKeyword: (v: string) => void;
  onSearch: () => void;
};

export default function DepartmentFilters({ keyword, onChangeKeyword, onSearch }: Props) {
  return (
    <div className={styles.searchBox}>
      <input
        className={styles.searchInput}
        placeholder="학과명, 코드 검색"
        value={keyword}
        onChange={(e) => onChangeKeyword(e.target.value)}
      />
      <button className={styles.searchBtn} type="button" onClick={onSearch}>
        검색
      </button>
    </div>
  );
}
