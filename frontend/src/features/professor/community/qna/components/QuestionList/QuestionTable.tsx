"use client";

import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/table";
import type { QnaListItemDto } from "../../api/types";
import styles from "./QuestionTable.module.css";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: QnaListItemDto[];
  loading: boolean;
};

export function QuestionTable({ items, loading }: Props) {
  const router = useRouter();
  const t = useI18n("community.qna.professor.table");

  const columns: Array<TableColumn<QnaListItemDto>> = [
    { header: t("headers.id"), align: "left", render: (r) => r.questionId },
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
          onClick={() => router.push(`/professor/community/qna/${r.questionId}`)}
        >
          {r.title}
        </button>
      ),
    },
    { header: t("headers.author"), align: "center", render: (r) => r.authorName },
    {
      header: t("headers.answerStatus"),
      align: "center",
      render: (r) => (r.hasAnswer ? t("answerDone") : t("answerPending")),
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
    />
  );
}
