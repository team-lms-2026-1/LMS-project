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
import { ConfirmModal } from "@/components/modal/ConfirmModal";
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
      render: (row) => {
        const now = new Date();
        const start = new Date(row.startAt);
        const end = new Date(row.endAt);

        if (now < start) {
          return <StatusPill status="PENDING" label="대기" />;
        } else if (now >= start && now <= end) {
          return <StatusPill status="ACTIVE" label="OPEN" />;
        } else {
          return <StatusPill status="INACTIVE" label="CLOSED" />;
        }
      }
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
            onClick={() => handleEdit(row.surveyId)}
          >
            수정
          </Button>
          <Button
            variant="danger"
            className={styles.deleteBtn}
            onClick={() => openDeleteConfirm(row.surveyId)}
          >
            삭제
          </Button>
        </div>
      ),
      stopRowClick: true,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>설문 통합 관리</h1>

        <div className={styles.searchRow}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="검색어 입력..."
            onSearch={handleSearch}
          />
        </div>

        <div className={styles.tableWrap}>
          <Table
            columns={columns}
            items={data}
            rowKey={(row) => row.surveyId}
            loading={loading}
            skeletonRowCount={10}
            onRowClick={(row) => handleEdit(row.surveyId)}
          />
        </div>

        <div className={styles.footerRow}>
          <div className={styles.footerLeft} />
          <div className={styles.footerCenter}>
            <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
          </div>
          <div className={styles.footerRight}>
            <Button
              variant="primary"
              onClick={() => router.push("/admin/surveys/new")}
            >
              등록
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="설문 삭제"
        message="정말 이 설문을 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirm}
        type="danger"
      />
    </div>
  );
}
