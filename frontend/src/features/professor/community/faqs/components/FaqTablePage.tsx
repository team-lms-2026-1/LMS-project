"use client";

import { Table, type TableColumn } from "@/components/table";
import styles from "./FaqTable.module.css";
import { useRouter } from "next/navigation";
import { FaqListItemDto } from "../api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    items: FaqListItemDto[];
    loading: boolean;
};

export function FaqTable({ items, loading }: Props) {
    const router = useRouter();
    const t = useI18n("community.faqs.professor.table");

  const goDetail = (id: number) => {
    router.push(`/professor/community/faqs/${id}`);
  };

  const columns: Array<TableColumn<FaqListItemDto>> = [
    { header: t("headers.id"), align: "center", render: (r) => r.faqId },
    {
      header: t("headers.category"),
      align: "center",
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
          onClick={(e) => {
            e.stopPropagation();
            goDetail(r.faqId);
          }}
        >
          {r.title}
        </button>
      ),
    },
    { header: t("headers.views"), align: "center", render: (r) => r.viewCount },
    { header: t("headers.createdAt"), align: "center", render: (r) => r.createdAt },
  ];

  return (
    <Table<FaqListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.faqId}
      emptyText={t("emptyText")}
      rowClassName={styles.rowTall}
      onRowClick={(r) => goDetail(r.faqId)}
    />
  );
}
