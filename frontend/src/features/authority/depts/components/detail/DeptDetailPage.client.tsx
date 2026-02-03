// features/authority/depts/components/detail/DeptDetailPage.client.tsx

"use client";

import { useEffect, useState } from "react";
import styles from "./DeptDetailPage.module.css";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple } from "@/components/pagination";
import { PageMeta } from "../../api/types";
import { Button } from "@/components/button";
import { cn } from "@/components/table";

import { DeptDetailProfessorTable } from "./DeptDetailProfessorTable";
import { DeptDetailStudentTable } from "./DeptDetailStudentTable";
import { DeptDetailMajorTable } from "./DeptDetailMajorTable";
import MajorCreateModal from "../modal/MajorCreateModal";

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
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta|null>(null);

  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const habdleSearch = () =>{
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const [loading, setLoading] = useState(false);

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    setKeyword(keywordInput.trim());
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const baseQuery = {
        page,
        size: 20,
        keyword: keyword || undefined,
      };

      if (tab === "PROFESSOR") {
        const res = await fetchDeptProfessorList(deptId, baseQuery);
        setProfessors(res.data);
        setMeta(res.meta);
      } else if (tab === "STUDENT") {
        const res = await fetchDeptStudentList(deptId, baseQuery);
        setStudents(res.data);
        setMeta(res.meta);
      } else if (tab === "MAJOR") {
        const res = await fetchDeptMajorList(deptId, baseQuery);
        setMajors(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error("[DeptDetailPageClient] load error:", err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [tab, deptId, keyword, page, refreshKey]);


  // 탭별 수량 표시용
  const currentCount =
    tab === "PROFESSOR"
      ? professors.length
      : tab === "STUDENT"
      ? students.length
      : majors.length;

  return (
  <div className={styles.page}>
    {/* ===== 상단 학과 헤더 ===== */}
    <div className={styles.header}>
      {/* 왼쪽: 제목 + 코드/담당교수 */}
      <div className={styles.headerLeft}>
        <h1 className={styles.deptTitle}>신학과 관리</h1>
        <div className={styles.deptMeta}>
          <span className={styles.deptCode}>학과코드 : TH001</span>
          <span className={styles.metaDivider}>|</span>
          <span className={styles.deptChair}>담당교수 김교수</span>
        </div>
      </div>

      {/* 오른쪽: 설명 */}
      <div className={styles.headerRight}>
        <p className={styles.deptDescription}>
          신학과는 기독교 신앙을 중심으로 성경, 교리, 역사, 윤리 등을 학문적으로
          연구하는 학과이다. 신앙과 학문의 의미를 탐구하는 기독교 사상이 사회와
          인간 삶에 어떤 영향을 미치는지 이해하는 것을 목표로 한다. 이를 통해
          신앙적 성찰뿐 아니라 인문학적 사고력과 윤리적 판단 능력을 기를 수 있다.
        </p>
      </div>
    </div>

    {/* ===== 탭 버튼 (공통 UI 그대로) ===== */}
    <div className={styles.tabRow}>
  <Button
    className={
      tab === "PROFESSOR"
        ? styles.tabButtonActive
        : styles.tabButtonInactive
    }
    onClick={() => setTab("PROFESSOR")}
  >
    소속 교수
  </Button>

  <Button
    className={
      tab === "STUDENT"
        ? styles.tabButtonActive
        : styles.tabButtonInactive
    }
    onClick={() => setTab("STUDENT")}
  >
    소속 학생
  </Button>

  <Button
    className={
      tab === "MAJOR"
        ? styles.tabButtonActive
        : styles.tabButtonInactive
    }
    onClick={() => setTab("MAJOR")}
  >
    전공 관리
  </Button>
</div>


    {/* ===== 검색 + 테이블 카드 ===== */}
    <div className={styles.card}>
      {/* 검색 줄 – 공통 SearchBar 사용 */}
      <div className={styles.searchRow}>
        <div className={styles.searchBarWrap}>
          <SearchBar
            value={keywordInput}
            onChange={setKeywordInput}
            onSearch={handleSearch}
            placeholder="이름 / 교번 검색"
          />
        </div>
        <div className={styles.countText}>
          {tab === "PROFESSOR" && <>교수수 : {currentCount}명</>}
          {tab === "STUDENT" && <>학생수 : {currentCount}명</>}
          {tab === "MAJOR" && <>전공수 : {currentCount}개</>}
        </div>
      </div>

      {/* 테이블 */}
      <div className={styles.tableWrap}>
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

      {/* 페이지네이션 + 전공 생성 버튼 */}
      <div className={styles.footerRow}>
        <div className={styles.paginationRow}>
          {meta && (
            <PaginationSimple
              page={page}
              totalPages={meta.totalPages ?? 1}
              onChange={setPage}
              disabled={loading}
            />
          )}
        </div>

        {tab === "MAJOR" && (
          <Button
            className={styles.majorCreateButton}
            onClick={() => setIsMajorModalOpen(true)}
          >
            전공 생성
          </Button>
        )}
      </div>
    </div>

    {/* 전공 생성 모달 */}
    {tab === "MAJOR" && isMajorModalOpen && (
      <MajorCreateModal
        deptId={deptId}
        onClose={() => setIsMajorModalOpen(false)}
        onCreated={() => {
          setRefreshKey((v) => v + 1);
          setIsMajorModalOpen(false);
        }}
      />
    )}
  </div>
);
}