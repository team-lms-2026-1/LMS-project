"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./QuestionDetailPage.module.css";
import type { QnaDetailDto } from "../../api/types";
import { fetchQnaDetail } from "../../api/qnaApi";
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
    category: raw?.category ?? null,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(pickCreatedAt(raw)),
    answer,
    hasAnswer,
    authorId: raw?.authorId,
    authorLoginId: raw?.authorLoginId,
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

export default function QuestionDetailpageClient() {
  const router = useRouter();
  const params = useParams<{ questionId?: string }>();
  const questionId = useMemo(() => Number(params?.questionId ?? 0), [params]);
  const t = useI18n("community.qna.professor.detail");

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!questionId || Number.isNaN(questionId)) {
      setState({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const res = await fetchQnaDetail(questionId);
        const data = normalizeDetail(res);
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

  const data = state.data;
  const answer = data?.answer ?? null;
  const answerContent = answer?.content?.trim() ?? "";
  const hasAnswerContent = Boolean(answerContent);

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumb}>
          <span className={styles.crumb} onClick={() => router.push("/professor/community/qna")}>
            Q&A
          </span>
          <span className={styles.sep}>›</span>
          <span className={styles.current}>{t("breadcrumbCurrent")}</span>
        </div>

        <h1 className={styles.title}>{t("title")}</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}
        {state.loading && <div className={styles.loadingBox}>{t("loading")}</div>}

        {!state.loading && data && (
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

            <div className={styles.footerRow}>
              <button className={styles.backBtn} onClick={() => router.push("/professor/community/qna")}>
                {t("buttons.list")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
