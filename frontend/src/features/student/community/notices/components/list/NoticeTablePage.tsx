"use client";

import { Table, type TableColumn } from "@/components/table";
import { NoticeListItemDto } from "../../api/types";
import styles from "./NoticeTable.module.css";

type Props = {
  items: NoticeListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function NoticesTable({ items, loading, onEditClick }: Props) {
  const columns: Array<TableColumn<NoticeListItemDto>> = [
    { header: "번호", align: "center", render: (r) => r.noticeId },
    { header: "분류", align: "center", render: (r) => r.categoryName },
    { header: "제목", align: "center", render: (r) => r.title },
    { header: "조회수", align: "center", render: (r) => r.viewCount },
    { header: "작성일", align: "center", render: (r) => r.createAt },
  ];

  return (
    <Table<NoticeListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.noticeId}
      emptyText="공지사항이 없습니다."
    />
  );
}
