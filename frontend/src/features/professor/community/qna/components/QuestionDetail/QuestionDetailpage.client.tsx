"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./QuestionDetailPage.module.css";
import type { QnaDetailDto } from "../../api/types";
import { fetchQnaDetail } from "../../api/qnaApi";

type LoadState =
    | { loading: true; error: string | null; data: null }
    | { loading: false; error: string | null; data: QnaDetailDto | null };

function normalizeDetail(payload: any): QnaDetailDto {
    const raw = payload?.data ?? payload;
    const created =
        raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

    return {
        questionId: Number(raw?.questionId ?? 0),
        category: raw?.category,
        title: String(raw?.title ?? ""),
        content: String(raw?.content ?? ""),
        authorName: String(raw?.authorName ?? ""),
        viewCount: Number(raw?.viewCount ?? 0),
        createdAt: String(created),
        hasAnswer: Boolean(raw?.hasAnswer),
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

    const [state, setState] = useState<LoadState>({
        loading: true,
        error: null,
        data: null,
    });

    useEffect(() => {
        if (!questionId || Number.isNaN(questionId)) {
            setState({ loading: false, error: "잘못된 질문 ID입니다.", data: null });
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
                    error: e?.message ?? "질문 데이터를 불러오지 못했습니다.",
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

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.breadcrumb}>
                    <span className={styles.crumb} onClick={() => router.push("/professor/community/qna")}>
                        Q&A
                    </span>
                    <span className={styles.sep}>›</span>
                    <span className={styles.current}>상세페이지</span>
                </div>

                <h1 className={styles.title}>Q&A</h1>

                {state.error && <div className={styles.errorMessage}>{state.error}</div>}

                {state.loading && (
                    <div className={styles.loadingBox}>
                        불러오는 중...
                    </div>
                )}

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

                        {/* 교수는 답변 작성 기능 없음. 답변 조회 기능은 추가할 수 있으나 현재 API상 답변 목록 조회는 별도 구현 필요할 수 있음. 
                일단 학생 페이지에 '답변'이 표시되는지 확인해야 하는데, QnaDetailDto에 hasAnswer만 있고 답변 내용이 없음.
                학생 페이지 로직상 답변은 별도 컴포넌트로 있거나, 지금은 구현되지 않았을 수 있음.
                "동일하게 구현"이므로 학생 페이지 로직을 그대로 따름.
            */}

                        <div className={styles.footerRow}>
                            {/* 수정/삭제 버튼 제거 */}
                            <button className={styles.backBtn} onClick={() => router.push("/professor/community/qna")}>
                                목록으로
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
