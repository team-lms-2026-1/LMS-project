"use client";

import Link from "next/link";
import styles from "../styles/resources.module.css";
import { MOCK_RESOURCES } from "../data/mockResources";

export default function ResourceDetailPage({ resourceId }: { resourceId: string }) {
  const item = MOCK_RESOURCES.find((r) => r.id === resourceId);

  if (!item) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>커뮤니티 &gt; 자료실</div>
        <div className={styles.card} style={{ padding: 16 }}>
          존재하지 않는 자료입니다.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>커뮤니티 &gt; 자료실 &gt; 상세페이지(수정 / 삭제)</div>

      <div className={styles.h1Row}>
        <h1 className={styles.h1}>자료실</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.detailBox}>
          {/* 상단 메타 */}
          <div className={styles.detailHeader}>
            <div className={`${styles.detailCell} ${styles.labelCell}`}>분류</div>
            <div className={styles.detailCell}>{item.category}</div>
            <div className={`${styles.detailCell} ${styles.labelCell}`}>작성일</div>
            <div className={styles.detailCell}>{item.createdAt}</div>
          </div>

          <div className={styles.detailTitleRow}>
            <div className={`${styles.detailCell} ${styles.labelCell}`}>작성자</div>
            <div className={styles.detailCell} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{item.author}</span>
              <span style={{ color: "#6b7280", fontSize: 12 }}>
                조회수: {item.views.toLocaleString()}
              </span>
            </div>
          </div>

          <div className={styles.detailContentRow}>
            <div className={`${styles.detailCell} ${styles.labelCell}`}>내용</div>
            <div className={`${styles.detailCell} ${styles.contentArea}`}>{item.content}</div>
          </div>

          <div className={styles.attachRow}>
            <div className={`${styles.detailCell} ${styles.labelCell}`}>첨부파일</div>
            <div className={styles.detailCell}>
              {item.attachmentName ? item.attachmentName : "-"}
            </div>
          </div>

          <div className={styles.actions}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href={`/community/resources/${item.id}/edit`}>
              수정
            </Link>
            <button className={styles.btn} type="button">
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
