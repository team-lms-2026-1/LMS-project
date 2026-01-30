// features/authority/depts/components/detail/DeptDetailPage.client.tsx

"use client";

import { useEffect, useState } from "react";
import styles from "./DeptDetailPage.module.css";

import { DeptDetailProfessorTable } from "./DeptDetailProfessorTable";
import { DeptDetailStudentTable } from "./DeptDetailStudentTable";
import { DeptDetailMajorTable } from "./DeptDetailMajorTable";

import {
  fetchDeptProfessorList,
  fetchDeptStudentList,
  fetchDeptMajorList,
} from "../../api/deptsApi";

import type {
  DeptProfessorListItemDto,
  DeptStudentListItemDto,
  DeptMajorListItemDto,
} from "../../api/types";

type Tab = "PROFESSOR" | "STUDENT" | "MAJOR";

type Props = {
  deptId: string; // page.tsx에서 params.deptId 넘겨줄 것
};

export default function DeptDetailPageClient({ deptId }: Props) {
  const [tab, setTab] = useState<Tab>("PROFESSOR");

  const [professors, setProfessors] = useState<DeptProfessorListItemDto[]>([]);
  const [students, setStudents] = useState<DeptStudentListItemDto[]>([]);
  const [majors, setMajors] = useState<DeptMajorListItemDto[]>([]);

  const [loading, setLoading] = useState(false);

  // 탭 변경 / deptId 변경 시 해당 목록 로딩
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === "PROFESSOR") {
          const res = await fetchDeptProfessorList(deptId, {
            page: 1,
            size: 20,
          });
          console.log("PROF LIST", res.data);
          setProfessors(res.data);
        } else if (tab === "STUDENT") {
          const res = await fetchDeptStudentList(deptId, {
            page: 1,
            size: 20,
          });
          console.log("STUD LIST", res.data);
          setStudents(res.data);
        } else if (tab === "MAJOR") {
          const res = await fetchDeptMajorList(deptId, {
            page: 1,
            size: 20,
          });
          console.log("MAJ LIST", res.data);
          setMajors(res.data);
        }
      } catch (err) {
        console.error("[DeptDetailPageClient] load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tab, deptId]);

  return (
    <div className={styles.page}>
      {/* 상단 학과 요약 (나중에 summary API 붙일 때 채우면 됨) */}
      <div className={styles.header}>
        <h1 className={styles.title}>학과 관리</h1>
        {/* 학과명, 학과코드, 소개 텍스트 등등 */}
      </div>

      {/* 탭 버튼 */}
      <div className={styles.tabRow}>
        <button
          className={tab === "PROFESSOR" ? styles.activeTab : styles.tab}
          onClick={() => setTab("PROFESSOR")}
        >
          소속 교수
        </button>
        <button
          className={tab === "STUDENT" ? styles.activeTab : styles.tab}
          onClick={() => setTab("STUDENT")}
        >
          소속 학생
        </button>
        <button
          className={tab === "MAJOR" ? styles.activeTab : styles.tab}
          onClick={() => setTab("MAJOR")}
        >
          전공 관리
        </button>
      </div>

      {/* 탭별 테이블 */}
      <div className={styles.card}>
        {tab === "PROFESSOR" && (
          <DeptDetailProfessorTable items={professors} loading={loading} />
        )}

        {tab === "STUDENT" && (
          <DeptDetailStudentTable items={students} loading={loading} />
        )}

        {tab === "MAJOR" && (
          <DeptDetailMajorTable items={majors} loading={loading} />
        )}
      </div>
    </div>
  );
}
