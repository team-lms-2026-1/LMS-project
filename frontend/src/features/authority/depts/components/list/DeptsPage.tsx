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

import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { Table } from "@/components/table";
import { TableColumn } from "@/components/table";
import { PaginationSimple } from "@/components/pagination";
import { StatusPill } from "@/components/status";

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
    page: number; // 1-base라고 가정
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    sort: string[];
  } | null;
};

// ✅ 👉 여기! 컴포넌트 바깥(위)에 고정 상수로 빼두기
const DEPT_COLUMNS: TableColumn<Department>[] = [
  { header: "학과코드", field: "code", align: "center", width: 120 },
  { header: "학과명", field: "name", align: "left" },
  { header: "담당교수", field: "headProfessor", align: "left", width: 150 },
  { header: "학생수", field: "studentCount", align: "right", width: 100 },
  { header: "교수수", field: "professorCount", align: "right", width: 100 },
  {
    header: "사용여부",
    align: "center",
    width: 130,
    render: (row) => (
      <StatusPill
        status={row.isActive ? "ACTIVE" : "INACTIVE"}
        label={row.isActive ? "on" : "off"}
      />
    ),
    stopRowClick: true,
  },
];

export default function DeptsPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ 학과 목록 로딩 함수 (페이지 인자 추가)
  async function loadDepartments(nextPage: number = 1) {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (nextPage > 0) searchParams.set("page", String(nextPage));
      if (keyword.trim()) {
        searchParams.set("keyword", keyword.trim());
      }

      const qs = searchParams.toString();
      const url = qs
        ? `/api/bff/admin/depts?${qs}`
        : `/api/bff/admin/depts`;

      const res = await getJson<DeptListResponse>(url);

      const mapped: Department[] = res.data.map((item) => ({
        id: String(item.deptId),
        code: item.deptCode,
        name: item.deptName,
        headProfessor: item.headProfessorName ?? "",
        studentCount: item.studentCount,
        professorCount: item.professorCount,
        isActive: item.isActive,
      }));

      setDepartments(mapped);

      const meta = res.meta;
      if (meta) {
        setPage(meta.page || nextPage);
        setTotalPages(meta.totalPages || 1);
      } else {
        setPage(1);
        setTotalPages(1);
      }
    } catch (e) {
      console.error("[DeptsPage] 학과 목록 불러오기 실패:", e);
      setError(
        "학과 목록을 불러오는 데 실패했습니다. (임시로 목업 데이터를 표시합니다)"
      );

      setDepartments(DEPT_MOCK_LIST);
      setPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  // ✅ 최초 렌더링 시 학과 목록 불러오기
  useEffect(() => {
    loadDepartments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadDepartments(1);
  };

  // ✅ 모달 닫힐 때 목록도 새로고침 (현재 페이지 유지)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    loadDepartments(page);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* 제목 */}
        <h1 className={styles.title}>학과 관리</h1>

        {/* 검색 영역 */}
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onSearch={handleSearch}
          placeholder="검색어 입력..."
          disabled={loading}
          loading={loading}
          className={styles.searchRow}
        />

        {/* 에러 메시지 */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* 로딩/테이블 */}
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <Table
              columns={DEPT_COLUMNS} // ← 여기!
              items={departments}
              rowKey={(row) => row.id}
              onRowClick={(row) => router.push(`/admin/depts/${row.id}`)}
              loading={loading}
              emptyText="학과가 없습니다."
            />
          </div>
        )}

        {/* 하단: 페이지네이션 + 등록 버튼 */}
        <div className={styles.footerRow}>
          {/* 왼쪽 공간 */}
          <div></div>

          {/* 가운데 페이지네이션 */}
          <PaginationSimple
            page={page}
            totalPages={totalPages}
            onChange={(nextPage) => loadDepartments(nextPage)}
            disabled={loading}
            className={styles.paginationCenter}
          />

          {/* 오른쪽 버튼 */}
          <div className={styles.rightButton}>
            <Button
              variant="primary"
              className={styles.primaryButton}
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              학과등록
            </Button>
          </div>
        </div>

        {/* 학과 등록 모달 */}
        {isModalOpen && <Deptmodal onClose={handleCloseModal} />}
      </div>
    </div>
  );
}
