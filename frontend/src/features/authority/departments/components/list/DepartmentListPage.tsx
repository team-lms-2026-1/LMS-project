"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mockDepartments } from "../../data/mockDepartments";
import { Department, DepartmentStatus } from "../../types";
import DepartmentTable from "./DepartmentTable";
import DepartmentCreateModal from "./DepartmentCreateModal";
import DepartmentFilters from "./DepartmentFilters";
import styles from "../../styles/DepartmentListPage.module.css";

export default function DepartmentListPage() {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<Department[]>(mockDepartments);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 검색 버튼을 눌렀을 때만 필터링하려면 state를 하나 더 두면 되지만,
  // 현재는 keyword 입력 즉시 필터링(간단/직관)
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return items;
    return items.filter(
      (d) =>
        d.name.toLowerCase().includes(k) ||
        d.code.toLowerCase().includes(k) ||
        d.id.toLowerCase().includes(k)
    );
  }, [keyword, items]);

  const onToggleStatus = (id: string, next: DepartmentStatus) => {
    setItems((prev) => prev.map((d) => (d.id === id ? { ...d, status: next } : d)));
  };

  const onCreate = (payload: { name: string; code: string; description: string }) => {
    const newDept: Department = {
      id: `D${String(items.length + 1).padStart(3, "0")}`,
      code: payload.code,
      name: payload.name,
      description: payload.description,
      createdAt: new Date().toISOString().slice(0, 10),
      status: "ACTIVE",
    };
    setItems((prev) => [newDept, ...prev]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>권한 관리 - 학과 관리</div>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>학과 관리</h1>

        <DepartmentFilters
          keyword={keyword}
          onChangeKeyword={setKeyword}
          onSearch={() => {
            /* 현재는 useMemo로 즉시 반영이라 별도 로직 없음 */
          }}
        />
      </div>

      <div className={styles.card}>
        <DepartmentTable data={filtered} onToggleStatus={onToggleStatus} />

        <div className={styles.footerRow}>
          <div className={styles.pagination}>
            <button type="button" className={styles.pageBtn} disabled>
              이전
            </button>
            <span className={styles.pageInfo}>1 / 1</span>
            <button type="button" className={styles.pageBtn} disabled>
              다음
            </button>
          </div>

          <button className={styles.primaryBtn} type="button" onClick={() => setIsCreateOpen(true)}>
            학과 등록
          </button>
        </div>
      </div>

      <DepartmentCreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(payload) => {
          onCreate(payload);
          setIsCreateOpen(false);
        }}
      />

      <div className={styles.hint}>
        상세 페이지 이동 예시:{" "}
        <Link className={styles.link} href="/authority/departments/D001">
          /authority/departments/D001
        </Link>
      </div>
    </div>
  );
}
