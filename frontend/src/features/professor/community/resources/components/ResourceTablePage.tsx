"use client";

import { Table, type TableColumn } from "@/components/table";
import { ResourceListItemDto } from "../api/types";
import styles from "./ResourceTable.module.css";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: ResourceListItemDto[];
  loading: boolean;
};

export function ResourceTable({ items, loading }: Props) {
  const router = useRouter();
  const t = useI18n("community.resources.professor.table");

  const columns: Array<TableColumn<ResourceListItemDto>> = [
    { header: t("headers.id"), align: "left", render: (r) => r.resourceId },
    {
      header: t("headers.category"),
      align: "left",
      render: (r) => {
        const c = r.category;
        if (!c) return t("uncategorized");
        return (
          <span className={styles.badge} style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}>
            {c.name}
          </span>
        );
      },
    },
    {
      header: t("headers.title"),
      align: "center",
      render: (r) => (
        <button
          type="button"
          className={styles.titleLink}
          onClick={() => router.push(`/professor/community/resources/${r.resourceId}`)}
        >
          {r.title}
        </button>
      ),
    },
    { header: t("headers.views"), align: "center", render: (r) => r.viewCount },
    { header: t("headers.createdAt"), align: "center", render: (r) => r.createdAt },
  ];

  return (
    <Table<ResourceListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.resourceId}
      emptyText={t("emptyText")}
    />
  );
}
