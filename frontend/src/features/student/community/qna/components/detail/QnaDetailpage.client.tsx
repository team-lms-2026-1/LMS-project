"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./QnaDetailPage.module.css";
import { Button } from "@/components/button";
import { useAuth } from "@/features/auth/AuthProvider";
import type { QnaDetailDto } from "../../api/types";
import { deleteQnaQuestion, fetchQnaDetail } from "../../api/qnasApi";
import DeleteModal from "../modal/DeleteModal.client";
import { useI18n } from "@/i18n/useI18n";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: QnaDetailDto | null };

function pickCreatedAt(raw: any) {
  return raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";
}

function normalizeDetail(payload: any): QnaDetailDto {
  const raw = payload?.data ?? payload;
  const answerRaw = raw?.answer ?? raw?.answerDto ?? raw?.answerInfo ?? raw?.answerContent ?? null;

  const answer =
    answerRaw && typeof answerRaw === "string"
      ? {
          answerId: 0,
          content: String(answerRaw),
          authorName: String(raw?.answerAuthorName ?? ""),
          createdAt: String(raw?.answerCreatedAt ?? ""),
        }
      : answerRaw
        ? {
            answerId: Number(answerRaw.answerId ?? 0),
            content: String(answerRaw.content ?? answerRaw.answerContent ?? ""),
            authorName: String(answerRaw.authorName ?? ""),
            createdAt: String(pickCreatedAt(answerRaw)),
            updatedAt: answerRaw?.updatedAt ? String(answerRaw.updatedAt) : undefined,
          }
        : null;

  const hasAnswer = typeof raw?.hasAnswer === "boolean" ? raw.hasAnswer : Boolean(answer?.content?.trim());

  return {
    questionId: Number(raw?.questionId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    authorLoginId: raw?.authorLoginId ?? raw?.author_login_id ?? null,
    authorId: raw?.authorId ?? raw?.authorAccountId ?? null,
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(pickCreatedAt(raw)),
    answer,
    hasAnswer,
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

export default function QnaDetailpageClient() {
  const router = useRouter();
  const params = useParams<{ questionId?: string }>();
  const questionId = useMemo(() => Number(params?.questionId ?? 0), [params]);
  const sp = useSearchParams();
  const t = useI18n("community.qna.student.detail");
  const toastOnceRef = useRef<string | null>(null);
  const inFlightRef = useRef<{ id: number; promise: Promise<QnaDetailDto> } | null>(null);

  const { state: authState } = useAuth();
  const me = authState.me;

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    data: null,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!questionId || Number.isNaN(questionId)) {
      setState({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const promise = (() => {
          const inFlight = inFlightRef.current;
          if (inFlight && inFlight.id === questionId) return inFlight.promise;

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
        if (!alive) return;
        setState({ loading: false, error: null, data });
      } catch (e: any) {
        if (!alive) return;
        setState({
          loading: false,
          error: e?.message ?? t("errors.loadFailed"),
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [questionId, t]);

  useEffect(() => {
    const toastType = sp.get("toast");
    if (!toastType) return;
    if (toastOnceRef.current === toastType) return;
    toastOnceRef.current = toastType;

    if (toastType === "updated") {
      toast.success(t("toasts.updated"), { id: "qna-toast-updated" });
    }

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");
    const qs = next.toString();
    const base = questionId ? `/student/community/qna/questions/${questionId}` : "/student/community/qna/questions";
    router.replace(qs ? `${base}?${qs}` : base);
  }, [sp, router, questionId, t]);

  const data = state.data;
  const answer = data?.answer ?? null;
  const answerContent = answer?.content?.trim() ?? "";
  const hasAnswerContent = Boolean(answerContent);

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  const isMine = useMemo(() => {
    if (!data || !me) return false;

    const byLogin = !!data.authorLoginId && !!me.loginId && String(data.authorLoginId) === String(me.loginId);
    const byId =
      typeof data.authorId === "number" &&
      typeof (me as any).accountId === "number" &&
      data.authorId === (me as any).accountId;

    return byLogin || byId;
  }, [data, me]);

  const handleDelete = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    if (deleteLoading) return;
    setDeleteOpen(false);
  }, [deleteLoading]);

  const confirmDelete = useCallback(async () => {
    if (!data) return;

    try {
      setDeleteLoading(true);
      await deleteQnaQuestion(data.questionId);
      setDeleteOpen(false);
      router.push("/student/community/qna/questions?toast=deleted");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? t("errors.deleteFailed"));
    } finally {
      setDeleteLoading(false);
    }
  }, [data, router, t]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumb}>
          <span className={styles.crumb} onClick={() => router.push("/student/community/qna/questions")}>
            Q&A
          </span>
          <span className={styles.sep}>&gt;</span>
          <span className={styles.current}>{t("breadcrumbCurrent")}</span>
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

              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t("labels.author")}</span>
                  <span className={styles.metaValue}>{data.authorName || "-"}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t("labels.createdAt")}</span>
                  <span className={styles.metaValue}>{formatDateTime(data.createdAt)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t("labels.views")}</span>
                  <span className={styles.metaValue}>{data.viewCount}</span>
                </div>
              </div>

              <div className={styles.contentBox}>
                <div className={styles.contentText}>{data.content}</div>
              </div>

              <div className={styles.footerRow}>
                <Button type="button" onClick={() => router.push("/student/community/qna/questions")}>
                  {t("buttons.list")}
                </Button>

                {isMine && (
                  <div className={styles.ownerActions}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => router.push(`/student/community/qna/questions/${data.questionId}/edit`)}
                    >
                      {t("buttons.edit")}
                    </Button>
                    <Button type="button" variant="danger" onClick={handleDelete}>
                      {t("buttons.delete")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.answerPanel}>
              <div className={styles.answerHeader}>
                <div className={styles.answerTitle}>{t("texts.answerTitle")}</div>
                {hasAnswerContent && (
                  <div className={styles.answerMeta}>
                    {answer?.authorName && (
                      <>
                        <span className={styles.answerMetaLabel}>{t("labels.author")}</span>
                        <span className={styles.answerMetaValue}>{answer.authorName}</span>
                      </>
                    )}
                    {answer?.createdAt && (
                      <>
                        <span className={styles.answerMetaLabel}>{t("labels.createdAt")}</span>
                        <span className={styles.answerMetaValue}>{formatDateTime(answer.createdAt)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.answerViewBox}>
                {hasAnswerContent ? (
                  <div className={styles.answerViewText}>{answerContent}</div>
                ) : (
                  <div className={styles.answerEmpty}>{t("texts.answerEmpty")}</div>
                )}
              </div>
            </div>
          </>
        )}

        <DeleteModal
          open={deleteOpen}
          targetLabel={t("targetLabel")}
          targetTitle={data?.title}
          loading={deleteLoading}
          onClose={closeDelete}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
