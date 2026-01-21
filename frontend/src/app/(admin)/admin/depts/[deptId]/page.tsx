// 📄 src/app/(admin)/admin/depts/[deptId]/page.tsx
"use client";

import MajorCreateModal from "./MajorCreateModal";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  DEPT_MOCK_LIST,
  Department,
  Professor,
  Student,
  Major,
} from "../DeptMock";
import styles from "./DeptDetailPage.module.css";

type TabKey = "professors" | "students" | "majors";

export default function DeptDetailPage() {
  const params = useParams();
  const deptId = params.deptId as string;

  const dept = DEPT_MOCK_LIST.find((d) => d.id === deptId);

  const [activeTab, setActiveTab] = useState<TabKey>("professors");
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);

  if (!dept) {
    return <div className={styles.page}>존재하지 않는 학과입니다.</div>;
  }

  return (
    <div className={styles.page}>
      {/* 상단 제목/요약 */}
      <h1 className={styles.title}>{dept.name} 관리</h1>
      <div className={styles.summaryRow}>
        <span>학과코드: {dept.code}</span>
        <span>담당교수: {dept.headProfessor}</span>
        <span>학생수: {dept.studentCount}명</span>
        <span>교수수: {dept.professorCount}명</span>
      </div>

      {/* 탭 바 */}
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
        {activeTab === "professors" && (
          <ProfessorsSection dept={dept} />
        )}
        {activeTab === "students" && (
          <StudentsSection dept={dept} />
        )}
        {activeTab === "majors" && <MajorsSection dept={dept} 
        onClickAdd={() => setIsMajorModalOpen(true)}/>}
      </div>
      {isMajorModalOpen && (
        <MajorCreateModal
          onClose={() => setIsMajorModalOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------------- 소속 교수 섹션 ---------------- */

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
        </tbody>
      </table>

      <PaginationRow />
    </div>
  );
}

/* ---------------- 소속 학생 섹션 ---------------- */

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
          재학생: 500명 휴학생: 100명 졸업생: 500명{/* 예시 텍스트 */}
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
        </tbody>
      </table>

      <PaginationRow />
    </div>
  );
}

/* ---------------- 전공 관리 섹션 ---------------- */

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
          className={styles.majorAddButton}
          onClick={onClickAdd}          // ✅ 모달 열기
        >
          전공 추가
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>전공명</th>
            <th>재학생 수</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.studentCount}명</td>
              <td className={styles.actionsCell}>
                <button className={styles.actionButton}>수정</button>
                <button className={styles.actionButton}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PaginationRow />
    </div>
  );
}

/* ---------------- 하단 페이지네이션 공통 ---------------- */

function PaginationRow() {
  return (
    <div className={styles.paginationRow}>
      <button className={styles.pageButton}>&lt; 이전</button>
      <span className={styles.pageStatus}>
        1 / 1
      </span>
      <button className={styles.pageButton}>다음 &gt;</button>
    </div>
  );
}
