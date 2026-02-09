"use client";

import React, { useCallback, useState } from "react";
import { Table, type TableColumn } from "@/components/table";
import type { NoticeDeleteTarget, NoticeListItemDto, NoticeTableProps } from "../../api/types";
import styles from "./NoticeTable.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import toast from "react-hot-toast";

import DeleteModal from "../modal/DeleteModal.client";

export function NoticesTable({ items, loading, onReload }: NoticeTableProps) {
  const router = useRouter();

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
      toast.success("공지사항이 삭제되었습니다.");
      router.refresh();
      onReload?.();
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Array<TableColumn<NoticeListItemDto>> = [
    { header: "번호", align: "left", render: (r) => r.noticeId },
    {
      header: "분류",
      align: "left",
      render: (r) => {
        const c = r.category;
        if (!c) return "미분류";
        return (
          <span className={styles.badge} style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}>
            {c.name}
          </span>
        );
      },
    },
    {
      header: "제목",
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
    { header: "조회수", align: "center", render: (r) => r.viewCount },
    { header: "작성일", align: "center", render: (r) => r.createdAt },
    {
      header: "관리",
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
            수정
          </Button>

          <Button
            variant="danger"
            onClick={(e: any) => {
              e?.stopPropagation?.();
              setDeleteTarget({ id: r.noticeId, title: r.title });
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
      <Table<NoticeListItemDto>
        columns={columns}
        items={items}
        loading={loading}
        skeletonRowCount={10}
        rowKey={(r) => r.noticeId}
        emptyText="공지사항이 없습니다."
        onRowClick={(r) => goDetail(r.noticeId)}
      />

      <DeleteModal
        open={!!deleteTarget}
        targetLabel="공지사항"
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
