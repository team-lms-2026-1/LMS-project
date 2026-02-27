"use client";

import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import type { QnaListItemDto, QnaTableProps } from "../../api/types";
import styles from "./QnaTable.module.css";
import { useI18n } from "@/i18n/useI18n";

export function QnaTable({ items, loading, onDeleteClick }: QnaTableProps) {
  const router = useRouter();
  const t = useI18n("community.qna.admin.table");

  const goDetail = (id: number) => {
    router.push(`/admin/community/qna/questions/${id}`);
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
          <Badge bgColor={c.bgColorHex} textColor={c.textColorHex}>
            {c.name}
          </Badge>
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
    {
      header: t("headers.answer"),
      width: 80,
      align: "center",
      render: (r) => (r.hasAnswer ? <span className={styles.check}>✓</span> : <span className={styles.dash}>-</span>),
    },
    { header: t("headers.views"), align: "center", render: (r) => r.viewCount },
    { header: t("headers.createdAt"), align: "center", render: (r) => r.createdAt },
    {
      header: t("headers.manage"),
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button
            variant="danger"
            onClick={(e: any) => {
              e?.stopPropagation?.();
              onDeleteClick(r.questionId);
            }}
          >
            {t("buttons.delete")}
          </Button>
        </div>
      ),
    },
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
