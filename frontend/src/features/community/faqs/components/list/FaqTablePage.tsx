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

export function FaqsTable({ items, loading, onReload }: FaqsTableProps) {
  const router = useRouter();

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const goDetail = (id: number) => {
    router.push(`/admin/community/faqs/${id}`);
  };

  const goEdit = (id: number) => {
    // ✅ FaqEditPage.client.tsx가 연결된 라우트로 맞춰줘
    const EDIT_PATH = `/admin/community/faqs/${id}/edit`;
    router.push(EDIT_PATH);
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
        throw new Error(text || `DELETE failed (${res.status})`);
      }

      setDeleteTarget(null);
      toast.success("FAQ가 삭제되었습니다.");
      router.refresh();
      onReload?.();
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Array<TableColumn<FaqListItemDto>> = [
    { header: "번호", align: "left", render: (r) => r.faqId },
    {
      header: "분류", align: "left", render: (r) => {
        const c = r.category;
        if (!c) return "미분류"; // ✅ null/undefined 방어
        return (
          <Badge bgColor={c.bgColorHex} textColor={c.textColorHex}>
            {c.name}
          </Badge>
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
            goDetail(r.faqId);
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
              goEdit(r.faqId);
            }}
          >
            수정
          </Button>
          <div className={styles.manageCell}>
            <Button
              variant="danger"
              onClick={(e: any) => {
                e?.stopPropagation?.();
                setDeleteTarget({ id: r.faqId, title: r.title });
              }}
            >
              삭제
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
        emptyText="FAQ? ????."
        onRowClick={(r) => goDetail(r.faqId)}
      />

      <DeleteModal
        open={!!deleteTarget}
        targetLabel="FAQ"
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
