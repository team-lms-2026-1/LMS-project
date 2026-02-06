"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ResourceDetailPage.module.css";
import type { ResourceListItemDto } from "../api/types";
import { fetchResourceDetail } from "../api/resourcesApi";

type LoadState =
    | { loading: true; error: string | null; data: null }
    | { loading: false; error: string | null; data: ResourceListItemDto | null };

function normalizeDetail(payload: any): ResourceListItemDto {
    const raw = payload?.data ?? payload;
    const created =
        raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

    return {
        resourceId: Number(raw?.resourceId ?? 0),
        category: raw?.category,
        title: String(raw?.title ?? ""),
        content: String(raw?.content ?? ""),
        authorName: String(raw?.authorName ?? ""),
        viewCount: Number(raw?.viewCount ?? 0),
        createdAt: String(created),
        files: Array.isArray(raw?.files) ? raw.files : [],
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

export default function ResourceDetailpageClient() {
    const router = useRouter();
    const params = useParams<{ resourceId?: string }>();
    const resourceId = useMemo(() => Number(params?.resourceId ?? 0), [params]);

    const [state, setState] = useState<LoadState>({
        loading: true,
        error: null,
        data: null,
    });

    useEffect(() => {
        if (!resourceId || Number.isNaN(resourceId)) {
            setState({ loading: false, error: "잘못된 자료실 ID입니다.", data: null });
            return;
        }

        let alive = true;
        (async () => {
            try {
                setState({ loading: true, error: null, data: null });
                const res = await fetchResourceDetail(resourceId);
                const data = normalizeDetail(res);
                if (!alive) return;
                setState({ loading: false, error: null, data });
            } catch (e: any) {
                if (!alive) return;
                setState({
                    loading: false,
                    error: e?.message ?? "자료실 데이터를 불러오지 못했습니다.",
                    data: null,
                });
            }
        })();

        return () => {
            alive = false;
        };
    }, [resourceId]);

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
                    <span className={styles.crumb} onClick={() => router.push("/professor/community/resources")}>
                        자료실
                    </span>
                    <span className={styles.sep}>›</span>
                    <span className={styles.current}>상세페이지</span>
                </div>

                <h1 className={styles.title}>자료실</h1>

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

                        <div className={styles.attachBox}>
                            <div className={styles.attachRow}>
                                <div className={styles.attachLabel}>첨부</div>

                                <div className={styles.attachList}>
                                    {Array.isArray(data.files) && data.files.length > 0 ? (
                                        <ul className={styles.attachUl}>
                                            {data.files.map((f: any, idx: number) => {
                                                const name =
                                                    typeof f === "string"
                                                        ? f
                                                        : String(f?.fileName ?? f?.name ?? f?.originalName ?? `첨부파일 ${idx + 1}`);

                                                const url =
                                                    typeof f === "object"
                                                        ? (f?.url ?? f?.downloadUrl ?? f?.path ?? "")
                                                        : "";

                                                return (
                                                    <li key={idx} className={styles.attachLi}>
                                                        {url ? (
                                                            <a className={styles.attachLink} href={url} target="_blank" rel="noreferrer">
                                                                {name}
                                                            </a>
                                                        ) : (
                                                            <span className={styles.attachName}>{name}</span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className={styles.attachEmpty}>첨부파일 없음</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.footerRow}>
                            <button className={styles.backBtn} onClick={() => router.push("/professor/community/resources")}>
                                목록으로
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
