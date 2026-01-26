// 위치: frontend/src/features/authority/depts/components/list/DeptsPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Deptmodal from "@/features/authority/depts/components/modal/Deptmodal";
import {
  DEPT_MOCK_LIST,
  type Department,
} from "@/features/authority/depts/data/DeptMock";
import { getJson } from "@/lib/http";
import styles from "@/features/authority/depts/styles/DeptsPage.module.css";

// ✅ 백엔드 /api/v1/admin/depts 응답 형태에 맞춘 타입
type DeptListResponse = {
  data: {
    deptId: number;
    deptCode: string;
    deptName: string;
    headProfessorName: string | null;
    studentCount: number;
    professorCount: number;
    isActive: boolean;
  }[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    sort: string[];
  };
};

export default function DeptsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 최초 렌더링 시 학과 목록 불러오기
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // BFF 경로 호출 → 내부에서 /api/v1/admin/depts로 프록시
        const res = await getJson<DeptListResponse>("/api/bff/admin/depts");

        // 백엔드 응답(data)을 화면에서 쓰는 Department 타입으로 매핑
        const mapped: Department[] = res.data.map((item) => ({
          id: String(item.deptId), // number → string
          code: item.deptCode,
          name: item.deptName,
          headProfessor: item.headProfessorName ?? "",
          studentCount: item.studentCount,
          professorCount: item.professorCount,
          isActive: item.isActive,
        }));

        setDepartments(mapped);
      } catch (e) {
        console.error("[DeptsPage] 학과 목록 불러오기 실패:", e);
        setError(
          "학과 목록을 불러오는 데 실패했습니다. (임시로 목업 데이터를 표시합니다)"
        );

        // 백엔드가 죽어 있어도 화면은 보이게 목업 사용
        setDepartments(DEPT_MOCK_LIST);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleSearch = () => {
    console.log("검색어:", keyword);
    // TODO: 나중에 ?keyword= 붙여서 /api/bff/admin/depts 호출하도록 확장
  };

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
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            className={styles.searchButton}
            type="button"
            onClick={handleSearch}
          >
            검색
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* 로딩/테이블 */}
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
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

                {departments.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      학과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 하단: 페이지네이션 + 등록 버튼 */}
        <div className={styles.footerRow}>
          <Pagination />
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            학과등록
          </button>
        </div>

        {isModalOpen && <Deptmodal onClose={() => setIsModalOpen(false)} />}
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

  const goDetail = () => {
    // ✅ 실제 라우트 구조에 맞게 수정
    router.push(`/admin/depts/${dept.id}`);
  };

  return (
    <tr className={styles.clickableRow} onClick={goDetail}>
      <td>{dept.code}</td>
      <td>{dept.name}</td>
      <td>{dept.headProfessor}</td>
      <td className={styles.textRight}>{dept.studentCount}명</td>
      <td className={styles.textRight}>{dept.professorCount}명</td>

      {/* 사용여부 + 수정 버튼 */}
      <td
        className={styles.usageCell}
        onClick={(e) => e.stopPropagation()} // 행 전체 클릭 막기
      >
        <button
          type="button"
          onClick={onToggle}
          className={dept.isActive ? styles.usageOn : styles.usageOff}
        >
          {dept.isActive ? "on" : "off"}
        </button>

        <button
          type="button"
          onClick={goDetail} // ✅ 수정 버튼도 동일하게 /admin/depts/[id] 로
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
