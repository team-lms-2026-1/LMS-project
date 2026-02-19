"use client";

import styles from "../styles/AccountListPage.module.css";
import { AccountType } from "../types";

type RoleFilter = "ALL" | AccountType;

import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { SearchBar } from "@/components/searchbar/SearchBar"; // ✅

type Props = {
  role: RoleFilter;
  keyword: string;
  deptId?: number | null; // ✅
  onChangeRole: (r: RoleFilter) => void;
  onChangeKeyword: (v: string) => void;
  onChangeDept: (d: number | null) => void; // ✅
  onApply: () => void;
};

export default function AccountFilters({
  role,
  keyword,
  deptId,
  onChangeRole,
  onChangeKeyword,
  onChangeDept,
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

      <div className={styles.filterRight}>
        {/* ✅ 학과 필터 (학생/교수일 때만 의미가 있지만, 일단 항상 노출하거나 조건부 노출) */}
        {(role === "STUDENT" || role === "PROFESSOR" || role === "ALL") && (
          <div style={{ width: 160 }}>
            <DeptFilterDropdown
              value={deptId ? String(deptId) : ""}
              onChange={(v) => onChangeDept(v ? Number(v) : null)}
            />
          </div>
        )}

        <SearchBar
          value={keyword}
          onChange={onChangeKeyword}
          onSearch={onApply}
          placeholder="ID/이름/이메일 검색"
          className={styles.customSearchBar}
        />
      </div>
    </div>
  );
}
