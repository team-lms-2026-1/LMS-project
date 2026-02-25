"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./QnaDetailPage.module.css";
import DeleteModal from "../modal/DeleteModal.client";
import type { LoadState, QnaDetailDto } from "../../api/types";
import { Button } from "@/components/button";
import {
  createQnaAnswer,
  deleteQnaAnswer,
  deleteQnaQuestion,
  fetchQnaDetail,
  updateQnaAnswer,
} from "../../api/QnasApi";
import { useI18n } from "@/i18n/useI18n";

const ANSWER_MAX = 1000;
const clampText = (value: string, max: number) => Array.from(value ?? "").slice(0, max).join("");

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
  const t = useI18n("community.qna.admin.detail");
  const inFlightRef = useRef<{ id: number; promise: Promise<QnaDetailDto> } | null>(null);

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

  const loadDetail = useCallback(async (options?: { force?: boolean }) => {
    if (!questionId || Number.isNaN(questionId)) {
      setState({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    try {
      setState({ loading: true, error: null, data: null });
      const promise = (() => {
        if (!options?.force) {
          const inFlight = inFlightRef.current;
          if (inFlight && inFlight.id === questionId) return inFlight.promise;
        }

        const nextPromise = fetchQnaDetail(questionId).then(normalizeDetail);
        inFlightRef.current = { id: questionId, promise: nextPromise };
        nextPromise.finally(() => {
          if (inFlightRef.current?.id === questionId && inFlightRef.current?.promise === nextPromise) {
            inFlightRef.current = null;
          }
        });
        return nextPromise;
      })();

      const data = await promise;

      setState({ loading: false, error: null, data });

      const init = data.answer?.content ?? "";
      const clamped = clampText(init, ANSWER_MAX);
      setAnswerText(clamped);
      setAnswerInit(clamped);
      setEditingAnswer(false);
    } catch (e: any) {
      setState({ loading: false, error: e?.message ?? t("errors.loadFailed"), data: null });
    }
  }, [questionId, t]);

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
  const isAnswerEditing = hasAnswer && editingAnswer;
  const isAnswerCreating = !hasAnswer && answerText.trim().length > 0;
  const isAnswerDirty = isAnswerEditing || isAnswerCreating;

  const leaveToastMessage = useMemo(() => {
    return isAnswerEditing ? t("errors.answerLeaveGuardEdit") : t("errors.answerLeaveGuardCreate");
  }, [isAnswerEditing, t]);

  const toastLeave = useCallback(() => {
    toast.error(leaveToastMessage);
  }, [leaveToastMessage]);

  const goList = useCallback(() => {
    if (savingAnswer) return;
    if (isAnswerDirty) {
      toastLeave();
      return;
    }
    router.push("/admin/community/qna");
  }, [isAnswerDirty, router, savingAnswer, toastLeave]);

  const onDeleteQuestion = useCallback(() => {
    if (!questionId) return;
    setDeleteTarget({ kind: "question" });
  }, [questionId]);

  useEffect(() => {
    if (!isAnswerDirty || savingAnswer) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isAnswerDirty, savingAnswer]);

  const pushedRef = useRef(false);
  useEffect(() => {
    if (!isAnswerDirty || savingAnswer) {
      pushedRef.current = false;
      return;
    }

    if (!pushedRef.current) {
      history.pushState(null, "", location.href);
      pushedRef.current = true;
    }

    const onPopState = () => {
      if (savingAnswer) return;
      history.pushState(null, "", location.href);
      toastLeave();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isAnswerDirty, savingAnswer, toastLeave]);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (!isAnswerDirty || savingAnswer) return;

      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;

      const hrefAttr = a.getAttribute("href") ?? "";
      if (hrefAttr.startsWith("mailto:") || hrefAttr.startsWith("tel:")) return;
      if (a.hasAttribute("download")) return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      e.preventDefault();
      e.stopPropagation();
      toastLeave();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [isAnswerDirty, savingAnswer, toastLeave]);

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
      toast.success(t("toasts.answerDeleted"));
      await loadDetail({ force: true });
    } catch (e: any) {
      toast.error(e?.message ?? t("errors.deleteFailed"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, questionId, loadDetail, router, t]);

  const onSubmitAnswer = useCallback(async () => {
    if (!questionId) return;
    if (!answerText.trim()) return toast.error(t("errors.answerRequired"));

    setSavingAnswer(true);
    try {
      if (hasAnswer) {
        await updateQnaAnswer(questionId, { content: answerText });
      } else {
        await createQnaAnswer(questionId, { content: answerText });
      }

      await loadDetail({ force: true });
      toast.success(hasAnswer ? t("toasts.answerUpdated") : t("toasts.answerCreated"));
    } catch (e: any) {
      toast.error(e?.message ?? t("errors.answerSaveFailed"));
    } finally {
      setSavingAnswer(false);
    }
  }, [questionId, answerText, hasAnswer, loadDetail, t]);

  const onClickEdit = useCallback(() => setEditingAnswer(true), []);

  const onCancelEdit = useCallback(() => {
    setAnswerText(answerInit);
    setEditingAnswer(false);
  }, [answerInit]);

  const onDeleteAnswer = useCallback(() => {
    if (!questionId || !hasAnswer) return;
    setDeleteTarget({ kind: "answer" });
  }, [questionId, hasAnswer]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumbRow}>
          <div className={styles.breadcrumb}>
            <span className={styles.crumb} onClick={goList}>
              Q&amp;A
            </span>
          <span className={styles.sep}>›</span>
            <span className={styles.current}>{t("breadcrumbCurrent")}</span>
          </div>

          <div className={styles.breadcrumbActions}>
            <Button variant="secondary" onClick={goList}>
              {t("buttons.list")}
            </Button>
          </div>
        </div>

        <h1 className={styles.title}>{t("title")}</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}
        {state.loading && <div className={styles.loadingBox}>{t("loading")}</div>}

        {!state.loading && data && (
          <>
            <div className={styles.detailBox}>
              <div className={styles.headRow}>
                <span className={styles.badge} style={badgeStyle}>
                  {data.category?.name ?? t("uncategorized")}
                </span>
                <div className={styles.headTitle}>{data.title}</div>
              </div>

              <div className={styles.metaBar}>
                <div className={styles.metaLeft}>
                  <span className={styles.metaLabel}>{t("labels.author")}:</span>
                  <span className={styles.metaValue}>{data.authorName || "-"}</span>
                </div>
                <div className={styles.metaRight}>
                  <span className={styles.metaLabel}>{t("labels.createdAt")}:</span>
                  <span className={styles.metaValue}>{formatDateTime(data.createdAt)}</span>
                  <span className={styles.metaDivider} />
                  <span className={styles.metaLabel}>{t("labels.views")}:</span>
                  <span className={styles.metaValue}>{data.viewCount}</span>
                </div>
              </div>

              <div className={styles.contentBox}>
                <div className={styles.contentText}>{data.content}</div>
              </div>

            </div>

            <div className={styles.actionsRow}>
              <Button variant="danger" onClick={onDeleteQuestion} disabled={deleting}>
                {t("buttons.deleteQuestion")}
              </Button>
            </div>

            <div className={styles.answerPanel}>
              <div className={styles.answerHeader}>
                <div className={styles.answerTitle}>{t("texts.answerTitle")}</div>

                {hasAnswer && !editingAnswer && (
                  <div className={styles.answerHeaderActions}>
                    <Button variant="primary" onClick={onClickEdit} disabled={savingAnswer || deleting}>
                      {t("buttons.answerEdit")}
                    </Button>
                    <Button variant="danger" onClick={onDeleteAnswer} disabled={savingAnswer || deleting}>
                      {t("buttons.answerDelete")}
                    </Button>
                  </div>
                )}
              </div>

              {!hasAnswer || editingAnswer ? (
                <>
                  <textarea
                    className={styles.answerTextarea}
                    placeholder={t("texts.answerPlaceholder")}
                    value={answerText}
                    onChange={(e) => setAnswerText(clampText(e.target.value, ANSWER_MAX))}
                    disabled={savingAnswer}
                    maxLength={ANSWER_MAX}
                  />
                  <div className={styles.answerActions}>
                    <Button onClick={onSubmitAnswer} disabled={savingAnswer || deleting}>
                      {hasAnswer ? t("buttons.answerSave") : t("buttons.answerSubmit")}
                    </Button>
                    <Button variant="secondary" onClick={onCancelEdit} disabled={savingAnswer}>
                      {t("buttons.answerCancel")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className={styles.answerViewBox}>
                  <div className={styles.answerViewText}>{answer?.content}</div>
                </div>
              )}

            </div>
          </>
        )}
      </div>

      <DeleteModal
        open={!!deleteTarget}
        targetLabel={deleteTarget?.kind === "answer" ? t("targetLabels.answer") : t("targetLabels.question")}
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
