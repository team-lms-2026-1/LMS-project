"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/qna-detail.module.css";
import { mockQna } from "../data/mockQna";
import type { QnaCategory } from "../types";

function badgeClass(category: QnaCategory, s: Record<string, string>) {
  switch (category) {
    case "서비스":
      return `${s.badge} ${s.badgeService}`;
    case "학습":
      return `${s.badge} ${s.badgeStudy}`;
    case "정책":
      return `${s.badge} ${s.badgePolicy}`;
    default:
      return `${s.badge} ${s.badgeEtc}`;
  }
}

export default function QnaDetailPage({ qnaId }: { qnaId: string }) {
  const router = useRouter();
  const item = useMemo(() => mockQna.find((q) => q.id === qnaId), [qnaId]);

  const [answerDraft, setAnswerDraft] = useState("");

  if (!item) return <div className={styles.wrap}>Q&amp;A를 찾을 수 없습니다.</div>;

  const onDeleteQuestion = () => {
    const ok = window.confirm("질문을 삭제하시겠습니까?");
    if (!ok) return;
    router.push("/community/qna");
  };

  const onSubmitAnswer = () => {
    // mock: 실제 저장 없음
    // 실제 구현 시: POST /qna/:id/answer
    router.refresh?.();
    router.push(`/community/qna/${qnaId}`); // 그대로 유지
  };

  const onDeleteAnswer = () => {
    const ok = window.confirm("답변을 삭제하시겠습니까?");
    if (!ok) return;
    router.push("/community/qna"); // mock
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>Q&amp;A</span>
        <span>-</span>
        <span>상세페이지(답변, 수정)</span>
      </div>

      <div className={styles.pageTitle}>Q&amp;A</div>

      {/* 질문 카드 */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={badgeClass(item.category, styles)}>{item.category}</span>
          <span className={styles.headTitle}>{item.title}</span>
        </div>

        <div className={styles.metaRow}>
          <div>작성자 : {item.author}</div>
          <div style={{ textAlign: "center" }}>작성일 : {item.createdAt}</div>
          <div style={{ textAlign: "right" }}>조회수 : {item.views.toLocaleString()}</div>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>{item.content}</div>
        </div>
      </div>

      {/* 답변 전: 입력 영역 + 질문삭제 + 답변/취소 */}
      {!item.answer && (
        <>
          <div className={styles.topActionsRow}>
            <button className={styles.btnDeleteQuestion} onClick={onDeleteQuestion}>
              질문삭제
            </button>
          </div>

          <div className={styles.answerInputWrap}>
            <textarea
              className={styles.answerTextarea}
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              placeholder="이곳에 답변하세요..."
            />
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSubmitAnswer}>
              답변
            </button>
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => router.back()}>
              취소
            </button>
          </div>
        </>
      )}

      {/* 답변 완료: 답변 카드 + 수정/삭제 */}
      {item.answer && (
        <>
          <div className={styles.answerCard}>
            <div className={styles.answerMetaRow}>
              <div>작성자 : {item.answer.author}</div>
              <div style={{ textAlign: "center" }}></div>
              <div style={{ textAlign: "right" }}>작성일 : {item.answer.createdAt}</div>
            </div>
            <div className={styles.answerBody}>
              <div className={styles.answerContent}>{item.answer.content}</div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => router.push(`/community/qna/${item.id}/edit`)}
            >
              수정
            </button>
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onDeleteAnswer}>
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
