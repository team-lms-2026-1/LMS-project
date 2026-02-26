"use client";

import { Table, type TableColumn } from "@/components/table";
import { ResourceListItemDto, type ResourceTableProps } from "../../api/types";
import styles from "./ResourceTable.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import DeleteModal from "../modal/DeleteModal.client";
import { useI18n } from "@/i18n/useI18n";

export function ResourcesTable({ items, loading, onReload }: ResourceTableProps) {
  const router = useRouter();
  const t = useI18n("community.resources.admin.table");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title?: string } | null>(null);

  const goDetail = useCallback(
    (id: number) => {
      router.push(`/admin/community/resources/${id}`);
    },
    [router]
  );

  const goEdit = (id: number) => {
    router.push(`/admin/community/resources/${id}/edit`);
  };

  const openDelete = (id: number, title?: string) => {
    setDeleteTarget({ id, title });
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleteLoading) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/community/resources/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${t("errors.deleteFailed")} (${res.status})`);
      }

      // ✅ 목록으로 이동 + toast
      setDeleteOpen(false);
      setDeleteTarget(null);
      onReload();
      router.refresh();
      router.push("/admin/community/resources?toast=deleted");
    } catch (e: any) {
      toast.error(e?.message ?? t("errors.deleteFailed"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Array<TableColumn<ResourceListItemDto>> = [
    {
      header: t("headers.id"),
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
      header: t("headers.category"),
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
              t("uncategorized")
            ) : (
              <Badge bgColor={c.bgColorHex} textColor={c.textColorHex}>
                {c.name}
              </Badge>
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
    {
      header: t("headers.manage"),
      width: 180,
      align: "center",
      stopRowClick: true, // ✅ 공용 Table이 이걸 지원한다면 함께 동작
      render: (r) => (
        <div className={styles.manageCell} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              goEdit(r.resourceId);
            }}
          >
            {t("buttons.edit")}
          </Button>

          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              openDelete(r.resourceId, r.title);
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

      <DeleteModal
        open={deleteOpen}
        targetLabel={t("targetLabel")}
        targetTitle={deleteTarget?.title}
        loading={deleteLoading}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
