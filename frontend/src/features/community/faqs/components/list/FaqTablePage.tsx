"use client";

import { useState } from "react";
import { Table, type TableColumn } from "@/components/table";
import { FaqListItemDto, type FaqsTableProps } from "../../api/types";
import styles from "./FaqTable.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import toast from "react-hot-toast";
import DeleteModal from "../modal/DeleteModal.client";
import { useI18n } from "@/i18n/useI18n";

export function FaqsTable({ items, loading, onReload }: FaqsTableProps) {
  const router = useRouter();
  const t = useI18n("community.faqs.admin.table");

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const goDetail = (id: number) => {
    router.push(`/admin/community/faqs/${id}`);
  };

  const goEdit = (id: number) => {
    router.push(`/admin/community/faqs/${id}/edit`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/community/faqs/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${t("toasts.deleteFailed")} (${res.status})`);
      }

      setDeleteTarget(null);
      toast.success(t("toasts.deleteSuccess"));
      router.refresh();
      onReload?.();
    } catch (e: any) {
      toast.error(e?.message ?? t("toasts.deleteFailed"));
    } finally {
      setDeleting(false);
    }
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
            goDetail(r.faqId);
          }}
        >
          {r.title}
        </button>
      ),
    },
    { header: t("headers.views"), align: "center", render: (r) => r.viewCount },
    { header: t("headers.createdAt"), align: "center", render: (r) => r.createdAt },
    {
      header: t("headers.manage"),
      width: 180,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={styles.manageCell}>
          <Button
            variant="secondary"
            onClick={(e: any) => {
              e?.stopPropagation?.();
              goEdit(r.faqId);
            }}
          >
            {t("buttons.edit")}
          </Button>
          <div className={styles.manageCell}>
            <Button
              variant="danger"
              onClick={(e: any) => {
                e?.stopPropagation?.();
                setDeleteTarget({ id: r.faqId, title: r.title });
              }}
            >
              {t("buttons.delete")}
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table<FaqListItemDto>
        columns={columns}
        items={items}
        loading={loading}
        skeletonRowCount={10}
        rowKey={(r) => r.faqId}
        emptyText={t("emptyText")}
        onRowClick={(r) => goDetail(r.faqId)}
      />

      <DeleteModal
        open={!!deleteTarget}
        targetLabel={t("targetLabel")}
        targetTitle={deleteTarget?.title}
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
