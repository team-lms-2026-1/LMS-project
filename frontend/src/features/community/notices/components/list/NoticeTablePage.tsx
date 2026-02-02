"use client";

import { Table, type TableColumn } from "@/components/table";
import { NoticeListItemDto } from "../../api/types";
import styles from "./NoticeTable.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";

type Props = {
  items: NoticeListItemDto[];
  loading: boolean;
  onReload : () => void;
};

export function NoticesTable({ items, loading, onReload  }: Props) {
  const router = useRouter();

  const goEdit = (id: number) => {
    // ✅ NoticeEditPage.client.tsx가 연결된 라우트로 맞춰줘
    const EDIT_PATH = `/admin/community/notices/${id}/edit`;
    router.push(EDIT_PATH);
  };

  const onDelete = async (id: number) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/community/notices/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // 백엔드/프록시가 에러 메시지를 주는 경우를 대비
        const text = await res.text().catch(() => "");
        throw new Error(text || `DELETE failed (${res.status})`);
      }

      alert("삭제되었습니다.");
      // ✅ 현재 페이지 데이터 갱신
      router.refresh();
      onReload ?.();
    } catch (e: any) {
      console.error(e);
      alert(`삭제 실패: ${e?.message ?? "알 수 없는 오류"}`);
    }
  };

  const columns: Array<TableColumn<NoticeListItemDto>> = [
    { header: "번호", align: "left", render: (r) => r.noticeId },
    { header: "분류", align: "left", render: (r) => {
        const c = r.category;
        if (!c) return "미분류"; // ✅ null/undefined 방어
        return (
          <span
            className={styles.badge}
            style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}
          >{c.name}</span>
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
          onClick={() => router.push(`/admin/community/notices/${r.noticeId}`)}
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
          <Button variant="secondary" onClick={() => goEdit(r.noticeId)}>
            수정
          </Button>
          <div className={styles.manageCell}>
          <Button variant="danger" onClick={() => onDelete(r.noticeId)}>
            삭제
          </Button>
        </div>
        </div>
        
      ),
    },
  ];

  return (
    <Table<NoticeListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.noticeId}
      emptyText="공지사항이 없습니다."
    />
  );
}
