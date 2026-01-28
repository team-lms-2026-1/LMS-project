"use client";

import { Table, type TableColumn } from "@/components/table";
import { ResourceListItemDto } from "../../api/types";
import styles from "./ResourceTable.module.css";

type Props = {
  items: ResourceListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function ResourceTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<ResourceListItemDto>> = [
    { header: "번호", align: "center", render: (r) => r.resourceId },
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
    <Table<ResourceListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.resourceId}
      emptyText="공지사항이 없습니다."
    />
  );
}
