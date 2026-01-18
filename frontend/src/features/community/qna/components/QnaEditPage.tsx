"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/qna-form.module.css";
import { mockQna } from "../data/mockQna";

export default function QnaEditPage({ qnaId }: { qnaId: string }) {
  const router = useRouter();
  const item = mockQna.find((q) => q.id === qnaId);

  const [answer, setAnswer] = useState(item?.answer?.content ?? "");

  if (!item) return <div className={styles.wrap}>Q&amp;A를 찾을 수 없습니다.</div>;

  const onSave = () => {
    // mock: 실제 PATCH 없음
    router.push(`/community/qna/${qnaId}`);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>Q&amp;A</span>
        <span>-</span>
        <span>답변 수정</span>
      </div>

      <div className={styles.pageTitle}>Q&amp;A</div>

      <div className={styles.formCard}>
        <table className={styles.formTable}>
          <tbody>
            <tr>
              <th>제목</th>
              <td>{item.title}</td>
            </tr>
            <tr>
              <th>내용</th>
              <td style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{item.content}</td>
            </tr>
            <tr>
              <th>답변</th>
              <td>
                <textarea
                  className={styles.textarea}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="답변을 수정하세요..."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => router.back()}>
          취소
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave}>
          수정
        </button>
      </div>
    </div>
  );
}
