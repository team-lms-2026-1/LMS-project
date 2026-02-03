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
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import toast from "react-hot-toast";

export default function SurveyListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const { data, loading, page, setPage, totalPages, refresh } = useSurveyList(keyword);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSearch = () => {
    setPage(1); // Reset page on search
    setKeyword(searchQuery);
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/surveys/${id}`);
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
  };

  const closeDeleteConfirm = () => {
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteSurvey(deleteId);
      toast.success("삭제되었습니다.");
      refresh();
    } catch (e) {
      console.error(e);
      toast.error("삭제 실패");
    } finally {
      closeDeleteConfirm();
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
      width: "150px",
      align: "center",
      render: (row) => row.createdAt ? row.createdAt.split(" ")[0] : "-",
    },
    {
      header: "기간",
      width: "220px",
      align: "center",
      render: (row) => (
        <>
          {new Date(row.startAt).toLocaleDateString()} ~ {new Date(row.endAt).toLocaleDateString()}
        </>
      ),
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
              openDeleteConfirm(row.surveyId);
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
            onSearch={handleSearch}
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

      <ConfirmDialog
        open={deleteId !== null}
        title="설문 삭제"
        description="정말 이 설문을 삭제하시겠습니까?"
        confirmText="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
}
