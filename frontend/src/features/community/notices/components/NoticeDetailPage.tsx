"use client";

import { useRouter } from "next/navigation";
import styles from "../styles/notice-detail.module.css";
import { mockNotices } from "../data/mockNotices";
import type { NoticeCategory } from "../types";

function badgeClass(category: NoticeCategory, stylesObj: Record<string, string>) {
  switch (category) {
    case "서비스":
      return `${stylesObj.badge} ${stylesObj.badgeService}`;
    case "학사":
      return `${stylesObj.badge} ${stylesObj.badgeAcademic}`;
    case "행사":
      return `${stylesObj.badge} ${stylesObj.badgeEvent}`;
    default:
      return `${stylesObj.badge} ${stylesObj.badgeNormal}`;
  }
}

export default function NoticeDetailPage({ noticeId }: { noticeId: string }) {
  const router = useRouter();
  const notice = mockNotices.find((n) => n.id === noticeId);

  if (!notice) return <div className={styles.wrap}>공지사항을 찾을 수 없습니다.</div>;

  const onDelete = () => {
    // mock 환경: 실제 삭제 API 없음
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;
    router.push("/community/notices");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <strong>공지사항</strong>
        <span>-</span>
        <span>상세페이지(수정 / 삭제)</span>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.pageTitle}>공지사항</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={badgeClass(notice.category, styles)}>{notice.category}</span>
          <span className={styles.headTitle}>{notice.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자: {notice.author}</div>
          <div style={{ textAlign: "center" }}>작성일: {notice.createdAt}</div>
          <div style={{ textAlign: "right" }}>조회수: {notice.views.toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{notice.content}</div>
        </div>

        <div className={styles.attach}>
          <div className={styles.attachLabel}>첨부<br />파일</div>
          <div className={styles.attachValue}>
            {notice.attachment?.name ?? "-"}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push(`/community/notices/${notice.id}/edit`)}>
          수정
        </button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onDelete}>
          삭제
        </button>
      </div>
    </div>
  );
}
