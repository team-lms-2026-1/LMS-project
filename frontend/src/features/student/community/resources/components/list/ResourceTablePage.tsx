"use client";

import { Table, type TableColumn } from "@/components/table";
import { ResourceListItemDto } from "../../api/types";
import styles from "./ResourceTable.module.css";
import { useRouter } from "next/navigation";

type Props = {
  items: ResourceListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function ResourceTable({ items, loading, onEditClick }: Props) {
  const router = useRouter();
  const goDetail = (id: number) => {
    router.push(`/student/community/resources/${id}`);
  };
  const columns: Array<TableColumn<ResourceListItemDto>> = [
    {
      header: "번호",
      align: "center",
      render: (r) => (
        <div
          className={styles.rowClickCell}
          onClickCapture={() => goDetail(r.resourceId)}
          role="button"
          tabIndex={0}
        >
          {r.resourceId}
        </div>
      ),
    },
    {
      header: "분류",
      align: "center",
      render: (r) => {
        const c = r.category;
        return (
          <div
            className={styles.rowClickCell}
            onClickCapture={() => goDetail(r.resourceId)}
            role="button"
            tabIndex={0}
          >
            {!c ? (
              "미분류"
            ) : (
              <span className={styles.badge} style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}>
                {c.name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "제목",
      align: "center",
      render: (r) => (
        <div
          className={styles.rowClickCell}
          onClickCapture={() => goDetail(r.resourceId)}
          role="button"
          tabIndex={0}
          title={r.title}
        >
          <span className={styles.titleText}>{r.title}</span>
        </div>
      ),
    },
    {
      header: "조회수",
      align: "center",
      render: (r) => (
        <div className={styles.rowClickCell} onClickCapture={() => goDetail(r.resourceId)} role="button" tabIndex={0}>
          {r.viewCount}
        </div>
      ),
    },
    {
      header: "작성일",
      align: "center",
      render: (r) => (
        <div className={styles.rowClickCell} onClickCapture={() => goDetail(r.resourceId)} role="button" tabIndex={0}>
          {r.createdAt}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.table}>
      <Table<ResourceListItemDto>
        columns={columns}
        items={items}
        loading={loading}
        skeletonRowCount={10}
        rowKey={(r) => r.resourceId}
        emptyText="자료가 없습니다."
      />
    </div>
  );
}
