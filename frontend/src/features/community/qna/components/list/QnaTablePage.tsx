"use client";

import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import type { QnaListItemDto } from "../../api/types";
import styles from "./QnaTable.module.css";

type Props = {
  items: QnaListItemDto[];
  loading: boolean;
  onDeleteClick: (questionId: number) => void;
};

export function QnaTable({ items, loading, onDeleteClick }: Props) {
  const router = useRouter();

  const columns: Array<TableColumn<QnaListItemDto>> = [
    { header: "번호", align: "center", render: (r) => r.questionId },
    {
      header: "분류",
      align: "center",
      render: (r) => {
        const c = r.category;
        if (!c) return "미분류";
        return (
          <span className={styles.badge} style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}>
            {c.name}
          </span>
        );
      },
    },
    {
      header: "제목",
      align: "center",
      render: (r) => (
        <button
          type="button"
          className={styles.titleLink}
          onClick={() => router.push(`/admin/community/qna/questions/${r.questionId}`)}
        >
          {r.title}
        </button>
      ),
    },

    // ✅ 추가: 답변 여부(체크)
    {
      header: "답변",
      width: 80,
      align: "center",
      render: (r) => (r.hasAnswer ? <span className={styles.check}>✓</span> : <span className={styles.dash}>-</span>),
    },

    { header: "조회수", align: "center", render: (r) => r.viewCount },
    { header: "작성일", align: "center", render: (r) => r.createdAt },
    {
      header: "관리",
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button variant="danger" onClick={() => onDeleteClick(r.questionId)}>
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<QnaListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.questionId}
      emptyText="Q&A가 없습니다."
    />
  );
}
