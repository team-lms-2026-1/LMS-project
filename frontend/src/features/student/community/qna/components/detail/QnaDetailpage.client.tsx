"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./QnaDetailPage.module.css";
import type { QnaListItemDto } from "../../api/types";
import { fetchQnaDetail, deleteQnaQuestion } from "../../api/QnasApi";
import { Button } from "@/components/button";
import { useAuth } from "@/features/auth/AuthProvider";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: QnaListItemDto | null };

function normalizeDetail(payload: any): QnaListItemDto {
  const raw = payload?.data ?? payload;

  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    questionId: Number(raw?.questionId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),

    // ✅ 본인 판별용(백엔드가 내려주면 사용)
    authorLoginId: raw?.authorLoginId ?? raw?.author_login_id ?? null,
    authorId: raw?.authorId ?? raw?.authorAccountId ?? null,

    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    hasAnswer: Boolean(raw?.hasAnswer ?? false),
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

  // ✅ AuthProvider 구조에 맞게 me 꺼내기
  const { state: authState } = useAuth();
  const me = authState.me;

  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!questionId || Number.isNaN(questionId)) {
      setState({ loading: false, error: "잘못된 question ID입니다.", data: null });
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
          error: e?.message ?? "질문을 불러오지 못했습니다.",
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [questionId]);

  const data = state.data;

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  // ✅ 본인 글인지 판별 (loginId 우선)
  const isMine = useMemo(() => {
    if (!data || !me) return false;

    const byLogin =
      !!data.authorLoginId &&
      !!me.loginId &&
      String(data.authorLoginId) === String(me.loginId);

    const byId =
      typeof data.authorId === "number" &&
      typeof (me as any).accountId === "number" &&
      data.authorId === (me as any).accountId;

    return byLogin || byId;
  }, [data, me]);

  const handleDelete = useCallback(async () => {
    if (!data) return;

    const ok = confirm("이 질문을 삭제할까요?");
    if (!ok) return;

    try {
      await deleteQnaQuestion(data.questionId);
      router.push("/student/community/qna/questions");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
    }
  }, [data, router]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumb}>
          <span className={styles.crumb} onClick={() => router.push("/student/community/qna/questions")}>
            Q&A
          </span>
          <span className={styles.sep}>›</span>
          <span className={styles.current}>상세페이지</span>
        </div>

        <h1 className={styles.title}>Q&A</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        {state.loading && <div className={styles.loadingBox}>불러오는 중...</div>}

        {!state.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {data.category?.name ?? "미분류"}
              </span>
              <div className={styles.headTitle}>{data.title}</div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성자</span>
                <span className={styles.metaValue}>{data.authorName || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성일</span>
                <span className={styles.metaValue}>{formatDateTime(data.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>조회수</span>
                <span className={styles.metaValue}>{data.viewCount}</span>
              </div>
            </div>

            <div className={styles.contentBox}>
              <div className={styles.contentText}>{data.content}</div>
            </div>

            <div className={styles.footerRow}>
              <Button type="button" onClick={() => router.push("/student/community/qna/questions")}>
                목록으로
              </Button>

              {/* ✅ 본인 글일 때만 삭제 버튼 표시 */}
              {isMine && (
                <div className={styles.ownerActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(`/student/community/qna/questions/${data.questionId}/edit`)}
                  >
                    수정
                  </Button>
                  <Button type="button" variant="danger" onClick={handleDelete}>
                    삭제
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
