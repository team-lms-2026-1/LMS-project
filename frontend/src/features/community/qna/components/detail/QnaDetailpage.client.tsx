"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./QnaDetailPage.module.css";
import toast from "react-hot-toast";
import DeleteModal from "../modal/DeleteModal.client";
import type { LoadState, QnaDetailDto } from "../../api/types";
import { fetchQnaDetail, deleteQnaQuestion, createQnaAnswer, updateQnaAnswer, deleteQnaAnswer } from "../../api/QnasApi";

function pickCreatedAt(raw: any) {
  return raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";
}

function normalizeDetail(payload: any): QnaDetailDto {
  const raw = payload?.data ?? payload;

  return {
    questionId: Number(raw?.questionId ?? 0),
    category: raw?.category ?? null,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    authorName: String(raw?.authorName ?? ""),
    authorId: typeof raw?.authorId === "number" ? raw.authorId : undefined,
    createdAt: String(pickCreatedAt(raw)),
    answer: raw?.answer
      ? {
          answerId: Number(raw.answer?.answerId ?? 0),
          content: String(raw.answer?.content ?? ""),
          authorName: String(raw.answer?.authorName ?? ""),
          createdAt: String(pickCreatedAt(raw.answer)),
          updatedAt: raw.answer?.updatedAt ? String(raw.answer.updatedAt) : undefined,
        }
      : null,
    hasAnswer: typeof raw?.hasAnswer === "boolean" ? raw.hasAnswer : undefined,
    status: raw?.status,
  };
}

function formatDateTime(v: string) {
  if (!v) return "-";
  if (v.includes(" ")) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function QnaDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ questionId?: string }>();
  const questionId = useMemo(() => Number(params?.questionId ?? 0), [params]);

  const [state, setState] = useState<LoadState<QnaDetailDto>>({
    loading: true,
    error: null,
    data: null,
  });

  const [answerText, setAnswerText] = useState("");
  const [answerInit, setAnswerInit] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ kind: "question" | "answer" } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const goList = useCallback(() => {
    router.push("/admin/community/qna"); // ✅ 목록 경로 통일(테이블과 동일 계열)
  }, [router]);

  const loadDetail = useCallback(async () => {
    if (!questionId || Number.isNaN(questionId)) {
      setState({ loading: false, error: "잘못된 question ID입니다.", data: null });
      return;
    }

    try {
      setState({ loading: true, error: null, data: null });
      const res = await fetchQnaDetail(questionId);
      const data = normalizeDetail(res);

      setState({ loading: false, error: null, data });

      const init = data.answer?.content ?? "";
      setAnswerText(init);
      setAnswerInit(init);
      setEditingAnswer(false);
    } catch (e: any) {
      setState({ loading: false, error: e?.message ?? "질문을 불러오지 못했습니다.", data: null });
    }
  }, [questionId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const data = state.data;
  const answer = data?.answer ?? null;

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  const hasAnswer = Boolean(answer?.answerId) || Boolean(answer?.content?.trim());

  const onDeleteQuestion = useCallback(() => {
    if (!questionId) return;
    setDeleteTarget({ kind: "question" });
  }, [questionId]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || !questionId) return;

    try {
      setDeleting(true);
      if (deleteTarget.kind === "question") {
        await deleteQnaQuestion(questionId);
        router.push("/admin/community/qna?toast=deleted");
        return;
      }

      await deleteQnaAnswer(questionId);
      toast.success("답변이 삭제되었습니다.");
      await loadDetail();
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, questionId, loadDetail, router]);

  const onSubmitAnswer = useCallback(async () => {
    if (!questionId) return;
    if (!answerText.trim()) return toast.error("답변 내용을 입력하세요.");

    setSavingAnswer(true);
    try {
      if (hasAnswer) {
        // cleaned comment
        await updateQnaAnswer(questionId, { content: answerText });
      } else {
        await createQnaAnswer(questionId, { content: answerText });
      }

      await loadDetail();
      toast.success(hasAnswer ? "답변이 수정되었습니다." : "답변이 등록되었습니다.");
    } catch (e: any) {
      toast.error(e?.message ?? "답변 저장에 실패했습니다.");
    } finally {
      setSavingAnswer(false);
    }
  }, [questionId, answerText, hasAnswer, loadDetail]);

  const onClickEdit = useCallback(() => setEditingAnswer(true), []);

  const onCancelEdit = useCallback(() => {
    setAnswerText(answerInit);
    setEditingAnswer(false);
  }, [answerInit]);

  const onDeleteAnswer = useCallback(() => {
    if (!questionId) return;
    if (!hasAnswer) return;
    setDeleteTarget({ kind: "answer" });
  }, [questionId, hasAnswer]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumb}>
          <span className={styles.crumb} onClick={goList}>
            Q&amp;A
          </span>
          <span className={styles.sep}>›</span>
          <span className={styles.current}>상세</span>
        </div>

        <h1 className={styles.title}>Q&amp;A</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}
        {state.loading && <div className={styles.loadingBox}>불러오는 중...</div>}

        {!state.loading && data && (
          <>
            <div className={styles.detailBox}>
              <div className={styles.headRow}>
                <span className={styles.badge} style={badgeStyle}>
                  {data.category?.name ?? "미분류"}
                </span>
                <div className={styles.headTitle}>{data.title}</div>
              </div>

              <div className={styles.metaBar}>
                <div className={styles.metaLeft}>
                  <span className={styles.metaLabel}>작성자:</span>
                  <span className={styles.metaValue}>{data.authorName || "-"}</span>
                </div>
                <div className={styles.metaRight}>
                  <span className={styles.metaLabel}>작성일:</span>
                  <span className={styles.metaValue}>{formatDateTime(data.createdAt)}</span>
                  <span className={styles.metaDivider} />
                  <span className={styles.metaLabel}>조회수:</span>
                  <span className={styles.metaValue}>{data.viewCount}</span>
                </div>
              </div>

              <div className={styles.contentBox}>
                <div className={styles.contentText}>{data.content}</div>
              </div>

              <div className={styles.actionsRow}>
                <button type="button" className={styles.deleteBtn} onClick={onDeleteQuestion} disabled={deleting}>
                  질문삭제
                </button>
              </div>
            </div>

            <div className={styles.answerPanel}>
              <div className={styles.answerHeader}>
                <div className={styles.answerTitle}>답변</div>

                {hasAnswer && !editingAnswer && (
                  <div className={styles.answerHeaderActions}>
                    <button type="button" className={styles.answerEditBtn} onClick={onClickEdit} disabled={savingAnswer || deleting}>
                      수정
                    </button>
                    <button type="button" className={styles.answerDeleteBtn} onClick={onDeleteAnswer} disabled={savingAnswer || deleting}>
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {!hasAnswer || editingAnswer ? (
                <>
                  <textarea
                    className={styles.answerTextarea}
                    placeholder="이곳에 답변하세요..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={savingAnswer}
                  />
                  <div className={styles.answerActions}>
                    <button type="button" className={styles.answerSubmitBtn} onClick={onSubmitAnswer} disabled={savingAnswer || deleting}>
                      {hasAnswer ? "저장" : "답변"}
                    </button>
                    <button type="button" className={styles.answerCancelBtn} onClick={onCancelEdit} disabled={savingAnswer}>
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.answerViewBox}>
                  <div className={styles.answerViewText}>{answer?.content}</div>
                </div>
              )}

              <div className={styles.answerFooter}>
                <button className={styles.backBtn} onClick={goList}>
                  목록으로
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteModal
        open={!!deleteTarget}
        targetLabel={deleteTarget?.kind === "answer" ? "??" : "Q&A"}
        targetTitle={deleteTarget?.kind === "question" ? data?.title : undefined}
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
