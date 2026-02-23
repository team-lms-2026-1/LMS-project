"use client";

import { Table, type TableColumn } from "@/components/table";
import { ResourceListItemDto } from "../../api/types";
import styles from "./ResourceTable.module.css";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: ResourceListItemDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
};

export function ResourceTable({ items, loading, onEditClick: _onEditClick }: Props) {
  const router = useRouter();
  const t = useI18n("community.resources.student.table");

  const goDetail = (id: number) => {
    router.push(`/student/community/resources/${id}`);
  };

  const columns: Array<TableColumn<ResourceListItemDto>> = [
    {
      header: t("headers.id"),
      align: "center",
      render: (r) => (
        <div className={styles.rowClickCell} onClickCapture={() => goDetail(r.resourceId)} role="button" tabIndex={0}>
          {r.resourceId}
        </div>
      ),
    },
    {
      header: t("headers.category"),
      align: "center",
      render: (r) => {
        const c = r.category;
        return (
          <div className={styles.rowClickCell} onClickCapture={() => goDetail(r.resourceId)} role="button" tabIndex={0}>
            {!c ? (
              t("uncategorized")
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
      header: t("headers.title"),
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
      header: t("headers.views"),
      align: "center",
      render: (r) => (
        <div className={styles.rowClickCell} onClickCapture={() => goDetail(r.resourceId)} role="button" tabIndex={0}>
          {r.viewCount}
        </div>
      ),
    },
    {
      header: t("headers.createdAt"),
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
        emptyText={t("emptyText")}
      />
    </div>
  );
}
