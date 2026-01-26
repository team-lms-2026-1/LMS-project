// 위치: frontend/src/features/authority/depts/components/detail/DeptDetailPage.tsx

"use client";

import { useEffect, useState } from "react";
import { getJson, ApiError } from "@/lib/http";
import {
  DEPT_MOCK_LIST,
  type Department,
  type Professor,
  type Student,
  type Major,
} from "@/features/authority/depts/data/DeptMock";
import styles from "@/features/authority/depts/styles/DeptDetailPage.module.css";
import MajorCreateModal from "@/features/authority/depts/components/modal/MajorCreateModal";

type TabKey = "professors" | "students" | "majors";

type Props = {
  deptId: string;
};


/* =========================
 *  백엔드 응답 타입들
 * ========================= */

/**
 * 학과 요약 상세 응답 타입
 * (GET /api/v1/admin/depts/{id}/summary)
 */
type DeptDetailResponse = {
  data: {
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    description?: string | null;
    chairProfessor?: string | null;
    professorCount: number;
    studentCount: {
      enrolled: number;
      leaveOfAbsence: number;
      graduated: number;
    };
    majorCount: number;
  };
  meta: unknown;
};

// 페이지네이션 메타
type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

/**
 * 교수 목록 응답 타입
 * (필드명은 백엔드 DTO에 맞게 필요하면 수정)
 */
type DeptProfessorsResponse = {
  data: {
    professorId: number;
    professorCode: string;
    professorName: string;
    email: string;
    phone: string;
  }[];
  meta: PageMeta;
};

/**
 * 학생 목록 응답 타입
 * (필드명은 백엔드 DTO에 맞게 필요하면 수정)
 */
type DeptStudentsResponse = {
  data: {
    studentId: number;
    studentNo: string;
    studentName: string;
    grade: number;
    status: string;
    majorName: string;
  }[];
  meta: PageMeta;
};

/**
 * 전공 목록 응답 타입
 * (GET /api/v1/admin/depts/{id}/majors)
 *
 * 예시:
 * {
 *   "majorId": 2,
 *   "majorCode": "CS_AI",
 *   "majorName": "인공지능",
 *   "enrolledStudentCount": 0
 * }
 */
type DeptMajorsResponse = {
  data: {
    majorId: number;
    majorCode: string;
    majorName: string;
    enrolledStudentCount: number;
  }[];
  meta: PageMeta;
};

export default function DeptDetailPage({ deptId }: Props) {
  const [dept, setDept] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("professors");
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 1) 학과 요약 정보(/summary) 불러오기
   *    GET /api/bff/admin/depts/:deptId → /api/v1/admin/depts/{id}/summary
   */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await getJson<DeptDetailResponse>(
          `/api/bff/admin/depts/${deptId}`
        );

        const d = res.data;

        // 총 학생 수 합산
        const totalStudentCount =
          (d.studentCount?.enrolled ?? 0) +
          (d.studentCount?.leaveOfAbsence ?? 0) +
          (d.studentCount?.graduated ?? 0);

        const mapped: Department = {
          id: String(d.departmentId),
          code: d.departmentCode,
          name: d.departmentName,
          description: d.description ?? "",
          headProfessor: d.chairProfessor ?? "",
          studentCount: totalStudentCount,
          professorCount: d.professorCount,
          isActive: true, // 백엔드에 필드 없으므로 기본값
          professors: [] as Professor[],
          students: [] as Student[],
          majors: [] as Major[],
        };

        setDept(mapped);
      } catch (e) {
        console.error("[DeptDetailPage] 학과 상세 불러오기 실패:", e);

        if (e instanceof ApiError) {
          if (e.status === 404) {
            setError("존재하지 않는 학과입니다.");
            setDept(null);
            setLoading(false);
            return;
          }

          setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");

          // 서버 에러일 때는 임시로 목업 데이터 fallback
          const fallback =
            DEPT_MOCK_LIST.find(
              (d) => String(d.id) === String(deptId)
            ) ?? null;
          setDept(fallback);
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
          setDept(null);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [deptId]);

  /**
   * 2) 교수 / 학생 / 전공 목록 불러오기
   *    - 학과 요약(dept)이 준비된 후에 호출
   *    - 교수/학생은 data가 비어 있으면 임시 더미 사용
   *    - 전공은 항상 실제 API 데이터 사용
   */
  useEffect(() => {
    if (!dept) return;

    let cancelled = false;

    return () => {
      cancelled = true;
    };
  }, [deptId, dept?.id]);

  /* =========================
   *  렌더링
   * ========================= */

  if (loading) {
    return <div className={styles.page}>불러오는 중...</div>;
  }

  if (!dept) {
    return (
      <div className={styles.page}>
        {error ?? "존재하지 않는 학과입니다."}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ===== 상단 요약 (회색 배경 영역) ===== */}
      <div className={styles.summarySection}>
        <div className={styles.summaryLeft}>
          <h1 className={styles.title}>{dept.name} 관리</h1>
          <div className={styles.metaInfo}>
            <span>학과코드: {dept.code}</span>
            <span>담당교수: {dept.headProfessor || "-"}</span>
            <span>학생수: {dept.studentCount}명</span>
            <span>교수수: {dept.professorCount}명</span>
          </div>
        </div>

        {dept.description && (
          <div className={styles.summaryRight}>
            <p className={styles.deptDescription}>{dept.description}</p>
          </div>
        )}
      </div>

      {/* 에러 메시지 (fallback 사용 중일 때 안내) */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* ===== 탭 바 ===== */}
      <div className={styles.tabBar}>
        <button
          className={
            activeTab === "professors"
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
          onClick={() => setActiveTab("professors")}
        >
          소속 교수
        </button>
        <button
          className={
            activeTab === "students"
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
          onClick={() => setActiveTab("students")}
        >
          소속 학생
        </button>
        <button
          className={
            activeTab === "majors"
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
          onClick={() => setActiveTab("majors")}
        >
          전공 관리
        </button>
      </div>

      {/* ===== 탭 내용 ===== */}
      <div className={styles.tabContent}>
        {activeTab === "professors" && <ProfessorsSection dept={dept} />}
        {activeTab === "students" && <StudentsSection dept={dept} />}
        {activeTab === "majors" && (
          <MajorsSection
            dept={dept}
            onClickAdd={() => setIsMajorModalOpen(true)}
          />
        )}
      </div>

      {/* ===== 전공 추가 모달 ===== */}
      {isMajorModalOpen && (
        <MajorCreateModal onClose={() => setIsMajorModalOpen(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                           소속 교수 섹션                            */
/* ------------------------------------------------------------------ */

function ProfessorsSection({ dept }: { dept: Department }) {
  const list = (dept.professors ?? []) as Professor[];

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            placeholder="이름 / 교번 검색"
          />
        </div>
        <div className={styles.sectionMeta}>
          교수수: {dept.professorCount}명
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>교번</th>
            <th>이름</th>
            <th>이메일</th>
            <th>전화번호</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.code}</td>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.phone}</td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={4} className={styles.emptyRow}>
                소속 교수가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <PaginationRow />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                           소속 학생 섹션                            */
/* ------------------------------------------------------------------ */

function StudentsSection({ dept }: { dept: Department }) {
  const list = (dept.students ?? []) as Student[];

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            placeholder="이름 / 학번 검색"
          />
        </div>
        <div className={styles.sectionMeta}>
          재학생: 0명 휴학생: 0명 졸업생: 0명
          {/* TODO: 백엔드에서 상태별 인원까지 내려주면 Department 타입 확장해서 표시 */}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>학번</th>
            <th>이름</th>
            <th>학년</th>
            <th>재학상태</th>
            <th>전공</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td>{s.studentNo}</td>
              <td>{s.name}</td>
              <td>{s.grade}</td>
              <td>{s.status}</td>
              <td>{s.majorName}</td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.emptyRow}>
                소속 학생이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <PaginationRow />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                           전공 관리 섹션                            */
/* ------------------------------------------------------------------ */

function MajorsSection({
  dept,
  onClickAdd,
}: {
  dept: Department;
  onClickAdd: () => void;
}) {
  const list = (dept.majors ?? []) as Major[];

  return (
    <div className={styles.sectionCard}>
      <div className={styles.majorsHeader}>
        <span className={styles.majorsTitle}>전공 관리</span>
        <button
          type="button"
          className={styles.majorAddButton}
          onClick={onClickAdd}
        >
          전공 추가
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>전공 코드</th>
            <th>전공명</th>
            <th>재학생 수</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => (
            <tr key={m.id}>
              <td>{m.code}</td>
              <td>{m.name}</td>
              <td>{m.studentCount}명</td>
              <td className={styles.actionsCell}>
                <button className={styles.actionButton}>수정</button>
                <button className={styles.actionButton}>삭제</button>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={4} className={styles.emptyRow}>
                전공이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <PaginationRow />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                        공통 페이지네이션 행                         */
/* ------------------------------------------------------------------ */

function PaginationRow() {
  return (
    <div className={styles.paginationRow}>
      <button className={styles.pageButton}>&lt; 이전</button>
      <span className={styles.pageStatus}>1 / 1</span>
      <button className={styles.pageButton}>다음 &gt;</button>
    </div>
  );
}
