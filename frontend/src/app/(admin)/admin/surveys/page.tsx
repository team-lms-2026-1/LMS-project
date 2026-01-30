"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { useSurveyList } from "@/features/surveys/hooks/useSurveyList";
import { deleteSurvey } from "@/features/surveys/service";
import { SurveyListResponse } from "@/features/surveys/types";
import { TableColumn } from "@/components/table/types";
import { useState } from "react";
import { Button } from "@/components/button/Button";
import { StatusPill, StatusType } from "@/components/status/StatusPill";

export default function SurveyListPage() {
  const router = useRouter();
  const { data, loading, page, setPage, totalPages, refresh } = useSurveyList();
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (id: number) => {
    router.push(`/admin/surveys/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteSurvey(id);
        alert("삭제되었습니다.");
        refresh();
      } catch (e) {
        console.error(e);
        alert("삭제 실패");
      }
    }
  };

  const columns: TableColumn<SurveyListResponse>[] = [
    {
      header: "번호",
      field: "surveyId",
      width: "80px",
      align: "center",
      render: (_, idx) => String((idx + 1) + (page - 1) * 10).padStart(5, "0"),
    },
    {
      header: "상태",
      field: "status",
      width: "100px",
      align: "center",
      render: (row) => (
        <StatusPill status={row.status as StatusType} />
      )
    },
    {
      header: "제목",
      field: "title",
      align: "center",
    },
    {
      header: "조회수",
      field: "viewCount",
      width: "100px",
      align: "center",
      render: (row) => row.viewCount?.toLocaleString() || "0",
    },
    {
      header: "작성일",
      field: "startAt",
      width: "150px",
      align: "center",
      render: (row) => row.startAt ? row.startAt.split(" ")[0] : "-",
    },
    {
      header: "관리",
      width: "160px",
      align: "center",
      render: (row) => (
        <div className={styles.actionCell}>
          <Button
            variant="secondary"
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.surveyId);
            }}
          >
            수정
          </Button>
          <Button
            variant="danger"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.surveyId);
            }}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>설문 통합 관리</h1>
        <div className={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="검색어 입력..."
            onSearch={() => { }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <Table
          columns={columns}
          items={data}
          rowKey={(row) => row.surveyId}
          loading={loading}
          onRowClick={(row) => handleEdit(row.surveyId)}
        />
      </div>

      <div className={styles.createBtnWrapper}>
        <Button
          variant="primary"
          onClick={() => router.push("/admin/surveys/new")}
        >
          등록
        </Button>
      </div>

      <div className={styles.paginationWrapper}>
        <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
