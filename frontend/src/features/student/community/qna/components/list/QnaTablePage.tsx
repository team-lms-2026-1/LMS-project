"use client";

import { Table, type TableColumn } from "@/components/table";
import { QnaListItemDto } from "../../api/types";
import styles from "./QnaTable.module.css";
import { useRouter } from "next/navigation";

type Props = {
  items: QnaListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function QnaTable({ items, loading, onEditClick }: Props) {
  const router = useRouter();
  const columns: Array<TableColumn<QnaListItemDto>> = [
    { header: "번호", align: "center", render: (r) => r.questionId },
    { header: "분류", align: "center", render: (r) => {
        const c = r.category;
        if (!c) return "미분류"; // ✅ null/undefined 방어
        return (
          <span
            className={styles.badge}
            style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}
          >{c.name}</span>
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
          onClick={() => router.push(`/student/community/qna/questions/${r.questionId}`)}
        >
          {r.title}
        </button>
      ),
    },
    { header: "조회수", align: "center", render: (r) => r.viewCount },
    { header: "작성일", align: "center", render: (r) => r.createdAt },
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
