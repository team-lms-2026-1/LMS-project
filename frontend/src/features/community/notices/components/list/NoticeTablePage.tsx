"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Table, type TableColumn } from "@/components/table";
import type { NoticeListItemDto } from "../../api/types";
import styles from "./NoticeTable.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";

import DeleteModal from "../modal/DeleteModal.client";

type Props = {
  items: NoticeListItemDto[];
  loading: boolean;
  onReload: () => void;
};

type DeleteTarget = {
  id: number;
  title?: string;
};

type ToastState = {
  open: boolean;
  message: string;
  variant: "success" | "error";
};

function CheckIcon() {
  return (
    <svg
      className={styles.toastIcon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg
      className={styles.toastIcon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 9v5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M12 17h.01"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M10.3 4.5h3.4c.7 0 1.35.38 1.68.98l6.1 11.2c.65 1.2-.22 2.67-1.58 2.67H3.8c-1.36 0-2.23-1.47-1.58-2.67l6.1-11.2c.33-.6.98-.98 1.68-.98Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NoticesTable({ items, loading, onReload }: Props) {
  const router = useRouter();

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(""), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const goDetail = (id: number) => {
    router.push(`/admin/community/notices/${id}`);
  };

  const goEdit = (id: number) => {
    router.push(`/admin/community/notices/${id}/edit`);
  };

  const requestDelete = async (id: number) => {
    const res = await fetch(`/api/admin/community/notices/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `DELETE failed (${res.status})`);
    }
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
      showToast("삭제되었습니다.");
      router.refresh();
      onReload?.();
    } catch (e: any) {
      console.error(e);
      showToast(`삭제 실패: ${e?.message ?? "알 수 없는 오류"}`);
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

      {toastMsg ? (
        <div role="status" aria-live="polite" className={styles.toast}>
          <span className={styles.toastIcon} aria-hidden>
            <svg viewBox="0 0 24 24" className={styles.toastIconSvg}>
              <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.toastText}>{toastMsg}</span>
        </div>
      ) : null}
    </>
  );
}
