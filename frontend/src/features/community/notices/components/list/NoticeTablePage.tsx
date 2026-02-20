"use client";

import React, { useCallback, useState } from "react";
import { Table, type TableColumn } from "@/components/table";
import type { NoticeDeleteTarget, NoticeListItemDto, NoticeTableProps } from "../../api/types";
import styles from "./NoticeTable.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

import DeleteModal from "../modal/DeleteModal.client";

export function NoticesTable({ items, loading, onReload }: NoticeTableProps) {
  const router = useRouter();
  const t = useI18n("community.notices.admin.table");

  const [deleteTarget, setDeleteTarget] = useState<NoticeDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const goDetail = (id: number) => {
    router.push(`/admin/community/notices/${id}`);
  };

  const goEdit = (id: number) => {
    router.push(`/admin/community/notices/${id}/edit`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/community/notices/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `DELETE failed (${res.status})`);
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

  const columns: Array<TableColumn<NoticeListItemDto>> = [
    { header: t("headers.id"), align: "center", render: (r) => r.noticeId },
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
            goDetail(r.noticeId);
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
              goEdit(r.noticeId);
            }}
          >
            {t("buttons.edit")}
          </Button>

          <Button
            variant="danger"
            onClick={(e: any) => {
              e?.stopPropagation?.();
              setDeleteTarget({ id: r.noticeId, title: r.title });
            }}
          >
            {t("buttons.delete")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table<NoticeListItemDto>
        columns={columns}
        items={items}
        loading={loading}
        skeletonRowCount={10}
        rowKey={(r) => r.noticeId}
        emptyText={t("emptyText")}
        onRowClick={(r) => goDetail(r.noticeId)}
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
