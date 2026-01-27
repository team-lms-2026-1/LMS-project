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

type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

type DeptProfessorsResponse = {
  data: {
    accountId: number;
    professorNo: string;
    name: string;
    email: string;
    phone: string;
  }[];
  meta: PageMeta;
};

type DeptStudentsResponse = {
  data: {
    studentId: number;
    studentNo: string;
    studentName?: string | null;
    name?: string | null;
    grade?: number | null;
    gradeLevel?: number | null;
    status?: string | null;
    academicStatus?: string | null;
    enrollmentStatus?: string | null;
    majorName?: string | null;
  }[];
  meta: PageMeta;
};

/**
 * 전공 목록 응답 타입
 *
 * 실제 백엔드 JSON 구조와 최대한 유연하게 맞춤
 */
type DeptMajorsItem = {
  // id 종류
  majorId?: number | null;
  id?: number | null;
  major_id?: number | null;

  // 코드 종류
  majorCode?: string | null;
  code?: string | null;
  major_code?: string | null;

  // 이름 종류
  majorName?: string | null;
  name?: string | null;
  major_name?: string | null;

  // 재학생 수 종류
  enrolledStudentCount?: number | null;
  studentCount?: number | null;
  enrolledCount?: number | null;
  student_count?: number | null;
};

type DeptMajorsResponse = {
  data: DeptMajorsItem[];
  meta: PageMeta;
};

/** 백엔드 전공 DTO → 화면용 Major 로 매핑하는 공통 함수 */
function mapMajorFromBackend(m: DeptMajorsItem | any): Major {
  const id =
    m.majorId ??
    m.id ??
    m.major_id ??
    m.majorID ??
    Date.now(); // fallback

  const code =
    m.majorCode ??
    m.code ??
    m.major_code ??
    m.codeValue ??
    "";

  const name =
    m.majorName ??
    m.name ??
    m.major_name ??
    m.nameKo ??
    "";

  const studentCount =
    m.enrolledStudentCount ??
    m.studentCount ??
    m.enrolledCount ??
    m.student_count ??
    0;

  return {
    id: String(id),
    code,
    name,
    studentCount,
  };
}

export default function DeptDetailPage({ deptId }: Props) {
  const [dept, setDept] = useState<Department | null>(null);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>("professors");
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ========== 1) 학과 요약 ========== */
  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const res = await getJson<DeptDetailResponse>(
          `/api/bff/admin/depts/${deptId}`
        );

        const d = res.data;

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
          isActive: true,
          professors: [],
          students: [],
          majors: [],
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

    loadSummary();
  }, [deptId]);

  /* ========== 2) 교수 / 학생 / 전공 목록 ========== */
  useEffect(() => {
    if (!deptId) return;
    let cancelled = false;

    async function loadLists() {
      try {
        setListLoading(true);

        // 교수 목록
        try {
          const profRes = await getJson<DeptProfessorsResponse>(
            `/api/bff/admin/depts/${deptId}/professors?page=1&size=20`
          );

          if (!cancelled) {
            const mapped: Professor[] = profRes.data.map((p) => ({
              id: String(p.accountId),
              code: p.professorNo,
              name: p.name,
              email: p.email,
              phone: p.phone,
            }));
            setProfessors(mapped);
          }
        } catch (e) {
          console.error("[DeptDetailPage] 교수 목록 불러오기 실패:", e);
          if (!cancelled) setProfessors([]);
        }

        // 학생 목록
        try {
          const stdRes = await getJson<DeptStudentsResponse>(
            `/api/bff/admin/depts/${deptId}/students?page=1&size=20`
          );

          if (!cancelled) {
            const mapped: Student[] = stdRes.data.map((s) => ({
              id: String(s.studentId),
              studentNo: s.studentNo ?? "",
              name: s.studentName ?? s.name ?? "",
              grade: s.grade ?? s.gradeLevel ?? 0,
              status:
                s.status ?? s.academicStatus ?? s.enrollmentStatus ?? "",
              majorName: s.majorName ?? "",
            }));

            setStudents(mapped);
          }
        } catch (e) {
          console.error("[DeptDetailPage] 학생 목록 불러오기 실패:", e);
          if (!cancelled) setStudents([]);
        }

        // 전공 목록
        try {
          const majorRes = await getJson<DeptMajorsResponse>(
            `/api/bff/admin/depts/${deptId}/majors?page=1&size=20`
          );

          console.log("[DeptDetailPage] majors raw:", majorRes.data);

          if (!cancelled) {
            const mapped: Major[] = majorRes.data.map(mapMajorFromBackend);
            setMajors(mapped);
          }
        } catch (e) {
          console.error("[DeptDetailPage] 전공 목록 불러오기 실패:", e);
          if (!cancelled) setMajors([]);
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    loadLists();

    return () => {
      cancelled = true;
    };
  }, [deptId]);

  /** ✅ 새 전공이 생성됐을 때 (모달에서 onCreated 호출했을 때) */
  // DeptDetailPage.tsx 안

// ✅ 이미 Major 타입을 받는다고 가정
const handleMajorCreated = (created: Major) => {
  console.log("[DeptDetailPage] onCreated param:", created);
  setMajors((prev) => [...prev, created]);
};

// 아래는 그대로 유지
{isMajorModalOpen && (
  <MajorCreateModal
    deptId={deptId}
    onClose={() => setIsMajorModalOpen(false)}
    onCreated={handleMajorCreated}
  />
)}


  /* ========== 렌더링 ========== */

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
      {/* 상단 요약 */}
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

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* 탭 */}
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

      {/* 탭 내용 */}
      <div className={styles.tabContent}>
        {listLoading && (
          <div className={styles.loading}>목록 불러오는 중...</div>
        )}

        {!listLoading && activeTab === "professors" && (
          <ProfessorsSection
            list={professors}
            totalCount={dept.professorCount}
          />
        )}

        {!listLoading && activeTab === "students" && (
          <StudentsSection list={students} />
        )}

        {!listLoading && activeTab === "majors" && (
          <MajorsSection
            list={majors}
            onClickAdd={() => setIsMajorModalOpen(true)}
          />
        )}
      </div>

      {/* 전공 추가 모달 */}
      {isMajorModalOpen && (
        <MajorCreateModal
          deptId={deptId}
          onClose={() => setIsMajorModalOpen(false)}
          onCreated={handleMajorCreated}
        />
      )}
    </div>
  );
}

/* ----- 밑의 섹션/테이블 렌더 함수들은 그대로 사용 ----- */

function ProfessorsSection({
  list,
  totalCount,
}: {
  list: Professor[];
  totalCount: number;
}) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            placeholder="이름 / 교번 검색"
          />
        </div>
        <div className={styles.sectionMeta}>교수수: {totalCount}명</div>
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

function StudentsSection({ list }: { list: Student[] }) {
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
              <td>{s.name || ""}</td>
              <td>{s.grade ? s.grade : ""}</td>
              <td>{s.status || ""}</td>
              <td>{s.majorName || ""}</td>
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

function MajorsSection({
  list,
  onClickAdd,
}: {
  list: Major[];
  onClickAdd: () => void;
}) {
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

function PaginationRow() {
  return (
    <div className={styles.paginationRow}>
      <button className={styles.pageButton}>&lt; 이전</button>
      <span className={styles.pageStatus}>1 / 1</span>
      <button className={styles.pageButton}>다음 &gt;</button>
    </div>
  );
}
