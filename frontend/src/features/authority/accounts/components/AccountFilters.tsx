"use client";

import styles from "../styles/AccountListPage.module.css";
import { AccountType } from "../types";

type RoleFilter = "ALL" | AccountType;

type Props = {
  role: RoleFilter;
  keyword: string;
  onChangeRole: (r: RoleFilter) => void;
  onChangeKeyword: (v: string) => void;
  onApply: () => void;
};

export default function AccountFilters({
  role,
  keyword,
  onChangeRole,
  onChangeKeyword,
  onApply,
}: Props) {
  return (
    <div className={styles.filterRow}>
      <div className={styles.roleGroup}>
        <button
          type="button"
          className={role === "ALL" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("ALL")}
        >
          전체
        </button>
        <button
          type="button"
          className={role === "STUDENT" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("STUDENT")}
        >
          학생
        </button>
        <button
          type="button"
          className={role === "PROFESSOR" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("PROFESSOR")}
        >
          교수
        </button>
        <button
          type="button"
          className={role === "ADMIN" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("ADMIN")}
        >
          관리자
        </button>
      </div>

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          placeholder="ID/이름/이메일 검색"
          value={keyword}
          onChange={(e) => onChangeKeyword(e.target.value)}
        />
        <button className={styles.searchBtn} type="button" onClick={onApply}>
          검색
        </button>
      </div>
    </div>
  );
}
