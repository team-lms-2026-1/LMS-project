// features/authority/depts/components/detail/DeptDetailPage.client.tsx

"use client";

import { useEffect, useState } from "react";
import styles from "./DeptDetailPage.module.css";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple } from "@/components/pagination";
import { Button } from "@/components/button";

import {
  PageMeta,
  DeptProfessorListItemDto,
  DeptStudentListItemDto,
  DeptMajorListItemDto,
  DeptEditResponse,
  SuccessResponse,
  ProfessorDropdownItem,
} from "../../api/types";

import {
  fetchDeptProfessorList,
  fetchDeptStudentList,
  fetchDeptMajorList,
  getDeptEdit,
} from "../../api/deptsApi";

import { DeptDetailProfessorTable } from "./DeptDetailProfessorTable";
import { DeptDetailStudentTable } from "./DeptDetailStudentTable";
import { DeptDetailMajorTable } from "./DeptDetailMajorTable";
import MajorCreateModal from "../modal/MajorCreateModal";

type Tab = "PROFESSOR" | "STUDENT" | "MAJOR";

type Props = {
  deptId: string;
};

type DeptHeader = {
  deptName: string;
  deptCode: string;
  headProfessorName: string;
  description?: string;
};

export default function DeptDetailPageClient({ deptId }: Props) {
  const [tab, setTab] = useState<Tab>("PROFESSOR");

  const [professors, setProfessors] = useState<DeptProfessorListItemDto[]>([]);
  const [students, setStudents] = useState<DeptStudentListItemDto[]>([]);
  const [majors, setMajors] = useState<DeptMajorListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [header, setHeader] = useState<DeptHeader | null>(null);
  const handleSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  useEffect(() => {
    const loadHeader = async () => {
      try {
        const res: SuccessResponse<DeptEditResponse> = await getDeptEdit(
          Number(deptId)
        );

        const { dept, professors } = res.data;

        const head =
          dept.headProfessorAccountId != null
            ? (professors as ProfessorDropdownItem[]).find(
              (p) => p.accountId === dept.headProfessorAccountId
            )
            : undefined;

        setHeader({
          deptName: dept.deptName,
          deptCode: dept.deptCode,
          headProfessorName: head?.name ?? "담당교수 미지정",
          description: dept.description,
        });
      } catch (err) {
        console.error("[DeptDetailPageClient] header load error:", err);
      }
    };

    loadHeader();
  }, [deptId]);

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
        console.error("[DeptDetailPageClient] list load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tab, deptId, keyword, page, refreshKey]);

  const currentCount =
    tab === "PROFESSOR"
      ? professors.length
      : tab === "STUDENT"
        ? students.length
        : majors.length;

  const deptName = header?.deptName ?? "학과";
  const deptCode = header?.deptCode ?? "-";
  const headProfessorName = header?.headProfessorName ?? "-";
  const description =
    header?.description ??
    `${deptName}은(는) 관련 전공 지식을 학습하고 인재를 양성하는 학과입니다.`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.deptTitle}>{deptName} 관리</h1>
          <div className={styles.deptMeta}>
            <span className={styles.deptCode}>학과코드 : {deptCode}</span>
            <span className={styles.metaDivider}> | </span>
            <span className={styles.deptChair}>
              담당교수 {headProfessorName}
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <p className={styles.deptDescription}>{description}</p>
        </div>
      </div>

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

      <div className={styles.card}>
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
