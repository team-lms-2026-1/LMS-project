"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEPT_MOCK_LIST, Department } from "./DeptMock";
import styles from "./DeptsPage.module.css";

export default function DeptsPage() {
  const [departments, setDepartments] =
    useState<Department[]>(DEPT_MOCK_LIST);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* 제목 */}
        <h1 className={styles.title}>학과 관리</h1>

        {/* 검색 영역 */}
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="검색어 입력..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>검색</button>
        </div>

        {/* 테이블 */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>학과코드</th>
                <th>학과명</th>
                <th>담당교수</th>
                <th>학생수</th>
                <th>교수수</th>
                <th className={styles.usageHeader}>사용여부</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <DepartmentRow
                  key={dept.id}
                  dept={dept}
                  onToggle={() => {
                    setDepartments((prev) =>
                      prev.map((d) =>
                        d.id === dept.id
                          ? { ...d, isActive: !d.isActive }
                          : d
                      )
                    );
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* 하단: 페이지네이션 + 등록 버튼 */}
        <div className={styles.footerRow}>
          <Pagination />
          <button className={styles.primaryButton}>학과등록</button>
        </div>
      </div>
    </div>
  );
}

function DepartmentRow({
  dept,
  onToggle,
}: {
  dept: Department;
  onToggle: () => void;
}) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/admin/depts/${dept.id}`);
  };

  return (
    <tr>
      <td>{dept.code}</td>
      <td>{dept.name}</td>
      <td>{dept.headProfessor}</td>
      <td className={styles.textRight}>{dept.studentCount}명</td>
      <td className={styles.textRight}>{dept.professorCount}명</td>

      {/* 사용여부 + 수정 버튼 한 칸에 */}
      <td className={styles.usageCell}>
        <button
          type="button"
          onClick={onToggle}
          className={
            dept.isActive ? styles.usageOn : styles.usageOff
          }
        >
          {dept.isActive ? "on" : "off"}
        </button>

        <button
          type="button"
          onClick={handleEdit}
          className={styles.editButton}
        >
          수정
        </button>
      </td>
    </tr>
  );
}

function Pagination() {
  return (
    <div className={styles.pagination}>
      <button className={styles.pageButton}>&lt;</button>
      <button className={styles.pageButtonActive}>1</button>
      <button className={styles.pageButton}>2</button>
      <button className={styles.pageButton}>3</button>
      <button className={styles.pageButton}>&gt;</button>
    </div>
  );
}
