"use client";

import { Table, type TableColumn } from "@/components/table";
import { ResourceListItemDto, type ResourceTableProps } from "../../api/types";
import styles from "./ResourceTable.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import DeleteModal from "../modal/DeleteModal.client";

export function ResourcesTable({ items, loading, onReload }: ResourceTableProps) {
  const router = useRouter();

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
        throw new Error(text || `삭제 실패 (${res.status})`);
      }

      // ✅ 목록으로 이동 + toast
      router.push("/admin/community/resources?toast=deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.message ?? "삭제에 실패했습니다.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Array<TableColumn<ResourceListItemDto>> = [
    {
      header: "번호",
      align: "left",
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
      align: "left",
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
    {
      header: "관리",
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
            수정
          </Button>

          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              openDelete(r.resourceId, r.title);
            }}
          >
            삭제
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
          emptyText="자료가 없습니다."
        />
      </div>

      <DeleteModal
        open={deleteOpen}
        targetLabel="자료"
        targetTitle={deleteTarget?.title}
        loading={deleteLoading}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
