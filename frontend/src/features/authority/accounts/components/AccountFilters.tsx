"use client";

import styles from "../styles/AccountListPage.module.css";
import { AccountType } from "../types";
import { useI18n } from "@/i18n/useI18n";

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
  const tRole = useI18n("authority.accounts.common.roles");
  const t = useI18n("authority.accounts.list.filters");

  return (
    <div className={styles.filterRow}>
      <div className={styles.roleGroup}>
        <button
          type="button"
          className={role === "ALL" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("ALL")}
        >
          {tRole("ALL")}
        </button>
        <button
          type="button"
          className={role === "STUDENT" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("STUDENT")}
        >
          {tRole("STUDENT")}
        </button>
        <button
          type="button"
          className={role === "PROFESSOR" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("PROFESSOR")}
        >
          {tRole("PROFESSOR")}
        </button>
        <button
          type="button"
          className={role === "ADMIN" ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onChangeRole("ADMIN")}
        >
          {tRole("ADMIN")}
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
          placeholder={t("searchPlaceholder")}
          className={styles.customSearchBar}
        />
      </div>
    </div>
  );
}
