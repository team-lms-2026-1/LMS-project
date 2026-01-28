"use client";

import { Table, type TableColumn } from "@/components/table";
import { FaqListItemDto } from "../../api/types";
import styles from "./FaqTable.module.css";

type Props = {
  items: FaqListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function FaqTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<FaqListItemDto>> = [
    { header: "번호", align: "center", render: (r) => r.faqId },
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
    { header: "제목", align: "center", render: (r) => r.title },
    { header: "조회수", align: "center", render: (r) => r.viewCount },
    { header: "작성일", align: "center", render: (r) => r.createAt },
  ];

  return (
    <Table<FaqListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.faqId}
      emptyText="FAQ가 없습니다."
    />
  );
}
