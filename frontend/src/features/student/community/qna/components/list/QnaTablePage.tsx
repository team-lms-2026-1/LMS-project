"use client";

import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/table";
import type { QnaListItemDto } from "../../api/types";
import styles from "./QnaTable.module.css";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: QnaListItemDto[];
  loading: boolean;
};

export function QnaTable({ items, loading }: Props) {
  const router = useRouter();
  const t = useI18n("community.qna.student.table");

  const goDetail = (id: number) => {
    router.push(`/student/community/qna/questions/${id}`);
  };

  const columns: Array<TableColumn<QnaListItemDto>> = [
    { header: t("headers.id"), align: "center", render: (r) => r.questionId },
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
            goDetail(r.questionId);
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
    <Table<QnaListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.questionId}
      emptyText={t("emptyText")}
      onRowClick={(r) => goDetail(r.questionId)}
    />
  );
}
