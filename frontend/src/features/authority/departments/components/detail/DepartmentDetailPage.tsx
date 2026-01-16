"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getMockDepartmentDetail } from "../../data/mockDepartmentDetail";
import { DepartmentDetail, Major } from "../../types";
import DepartmentInfoCard from "./DepartmentInfoCard";
import DepartmentTabs, { DepartmentTabKey } from "./DepartmentTabs";
import ProfessorTable from "./ProfessorTable";
import StudentTable from "./StudentTable";
import MajorTable from "./MajorTable";
import MajorCreateModal from "./MajorCreateModal";
import styles from "../../styles/DepartmentDetailPage.module.css";

type Props = {
  departmentId: string;
};

export default function DepartmentDetailPage({ departmentId }: Props) {
  const initial = useMemo(() => getMockDepartmentDetail(departmentId), [departmentId]);
  const [detail, setDetail] = useState<DepartmentDetail>(initial);

  const [tab, setTab] = useState<DepartmentTabKey>("PROFESSOR");
  const [keyword, setKeyword] = useState("");
  const [isMajorOpen, setIsMajorOpen] = useState(false);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return detail;

    if (tab === "PROFESSOR") {
      return {
        ...detail,
        professors: detail.professors.filter(
          (p) =>
            p.name.toLowerCase().includes(k) ||
            p.email.toLowerCase().includes(k) ||
            p.id.toLowerCase().includes(k)
        ),
      };
    }
    if (tab === "STUDENT") {
      return {
        ...detail,
        students: detail.students.filter(
          (s) =>
            s.name.toLowerCase().includes(k) ||
            s.email.toLowerCase().includes(k) ||
            s.id.toLowerCase().includes(k)
        ),
      };
    }
    return {
      ...detail,
      majors: detail.majors.filter(
        (m) =>
          m.name.toLowerCase().includes(k) ||
          m.code.toLowerCase().includes(k) ||
          m.id.toLowerCase().includes(k)
      ),
    };
  }, [detail, keyword, tab]);

  const addMajor = (payload: { name: string; code: string; description: string }) => {
    const newMajor: Major = {
      id: `M${String(detail.majors.length + 1).padStart(2, "0")}`,
      code: payload.code,
      name: payload.name,
    };
    setDetail((prev) => ({ ...prev, majors: [newMajor, ...prev.majors] }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link className={styles.link} href="/authority/departments">
          권한 관리 - 학과 관리
        </Link>{" "}
        <span className={styles.sep}>/</span> 상세
      </div>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>신학과 관리</h1>
      </div>

      <div className={styles.card}>
        <DepartmentInfoCard department={detail.department} />

        <div className={styles.tabsRow}>
          <DepartmentTabs value={tab} onChange={(v) => { setTab(v); setKeyword(""); }} />

          <div className={styles.tools}>
            <input
              className={styles.searchInput}
              placeholder="이름/이메일/코드 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className={styles.searchBtn} type="button">
              검색
            </button>

            {tab === "MAJOR" && (
              <button
                className={styles.primaryBtn}
                type="button"
                onClick={() => setIsMajorOpen(true)}
              >
                전공 추가
              </button>
            )}
          </div>
        </div>

        <div className={styles.tabBody}>
          {tab === "PROFESSOR" && <ProfessorTable data={filtered.professors} />}
          {tab === "STUDENT" && <StudentTable data={filtered.students} />}
          {tab === "MAJOR" && <MajorTable data={filtered.majors} />}
        </div>

        <div className={styles.footerRow}>
          <button className={styles.ghostBtn} type="button">
            권한 관리
          </button>
        </div>
      </div>

      <MajorCreateModal
        open={isMajorOpen}
        onClose={() => setIsMajorOpen(false)}
        onSubmit={(payload) => {
          addMajor(payload);
          setIsMajorOpen(false);
        }}
      />
    </div>
  );
}
