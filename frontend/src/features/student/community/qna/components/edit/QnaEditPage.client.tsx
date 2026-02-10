"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./QnaEditPage.module.css";
import type { Category, UpdateQnaQuestionRequestDto, QnaDetailDto } from "../../api/types";
import { fetchQnaCategories, fetchQnaDetail, updateQnaQuestion } from "../../api/qnasApi";
import { Button } from "@/components/button";
import { useAuth } from "@/features/auth/AuthProvider";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: QnaDetailDto | null };

function normalizeDetail(payload: any): QnaDetailDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    questionId: Number(raw?.questionId ?? 0),
    category: raw?.category ?? null,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    authorLoginId: raw?.authorLoginId ?? raw?.author_login_id ?? null,
    authorId: raw?.authorId ?? raw?.authorAccountId ?? null,
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    hasAnswer: Boolean(raw?.hasAnswer ?? false),
  };
}

export default function QnaEditPageClient() {
  const router = useRouter();
  const params = useParams<{ questionId?: string }>();
  const questionId = useMemo(() => Number(params?.questionId ?? 0), [params]);

  const { state: authState } = useAuth();
  const me = authState.me;

  const LIST_PATH = "/student/community/qna/questions";
  const DETAIL_PATH = `/student/community/qna/questions/${questionId}`;

  const [load, setLoad] = useState<LoadState>({ loading: true, error: null, data: null });

  // form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // ✅ 카테고리 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchQnaCategories();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!alive) return;
        setCategories(list);
      } catch {
        if (!alive) return;
        setCategories([]);
      } finally {
        if (alive) setLoadingCats(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ 상세 로드
  useEffect(() => {
    if (!questionId || Number.isNaN(questionId)) {
      setLoad({ loading: false, error: "잘못된 question ID입니다.", data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoad({ loading: true, error: null, data: null });
        const res = await fetchQnaDetail(questionId);
        const data = normalizeDetail(res);
        if (!alive) return;

        setLoad({ loading: false, error: null, data });

        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setCategoryId(data.category?.categoryId ? String(data.category.categoryId) : "");
      } catch (e: any) {
        if (!alive) return;
        setLoad({ loading: false, error: e?.message ?? "질문을 불러오지 못했습니다.", data: null });
      }
    })();

    return () => {
      alive = false;
    };
  }, [questionId]);

  const data = load.data;

  // ✅ 본인 글인지 판별
  const isMine = useMemo(() => {
    if (!data || !me) return false;

    const byLogin =
      !!data.authorLoginId && !!me.loginId && String(data.authorLoginId) === String(me.loginId);

    const byId =
      typeof data.authorId === "number" &&
      typeof (me as any).accountId === "number" &&
      data.authorId === (me as any).accountId;

    return byLogin || byId;
  }, [data, me]);

  // ✅ 본인 글이 아니면 접근 차단
  useEffect(() => {
    if (!load.loading && data && me && !isMine) {
      alert("본인이 작성한 글만 수정할 수 있습니다.");
      router.replace(DETAIL_PATH);
    }
  }, [load.loading, data, me, isMine, router, DETAIL_PATH]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving && !load.loading && isMine;
  }, [title, content, saving, load.loading, isMine]);

  const onCancel = () => router.push(DETAIL_PATH);

  const onSave = async () => {
    setFormError("");

    const t = title.trim();
    const c = content.trim();
    if (!t) return setFormError("제목을 입력하세요.");
    if (!c) return setFormError("내용을 입력하세요.");
    if (!isMine) return setFormError("본인이 작성한 글만 수정할 수 있습니다.");

    const body: UpdateQnaQuestionRequestDto = {
      title: t,
      content: c,
      categoryId: categoryId ? Number(categoryId) : null,
    };

    setSaving(true);
    try {
      await updateQnaQuestion(questionId, body);
      router.push(DETAIL_PATH);
      router.refresh();
    } catch (e: any) {
      setFormError(e?.message ?? "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ 선택된 카테고리(표시용)
  const selectedCategory = useMemo(() => {
    if (!categoryId) return null;
    const id = Number(categoryId);
    if (!Number.isFinite(id)) return null;
    return categories.find((c) => c.categoryId === id) ?? null;
  }, [categoryId, categories]);

  const badgeStyle = useMemo(() => {
    const bg = selectedCategory?.bgColorHex ?? "#EEF2F7";
    const fg = selectedCategory?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [selectedCategory?.bgColorHex, selectedCategory?.textColorHex]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* ✅ breadcrumb: CSS에 맞춰 breadcrumbRow 제거 */}
        <div className={styles.breadcrumb}>
          <span className={styles.crumb} onClick={() => router.push(LIST_PATH)}>
            Q&A
          </span>
          <span className={styles.sep}>›</span>
          <span className={styles.current}>수정페이지</span>
        </div>

        <h1 className={styles.title}>Q&A 수정</h1>

        {load.error && <div className={styles.errorMessage}>{load.error}</div>}
        {formError && <div className={styles.errorMessage}>{formError}</div>}

        {load.loading && <div className={styles.loadingBox}>불러오는 중...</div>}

        {!load.loading && data && (
          <div className={styles.formBox}>
            {/* ✅ 헤더: 배지 + 제목 입력 (CSS: headRow/badge/titleInput) */}
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {selectedCategory?.name ?? "미분류"}
              </span>

              <input
                className={styles.titleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                placeholder="제목"
                maxLength={200}
              />
            </div>

            {/* ✅ 메타: 분류 select (CSS: metaRow/metaItem/metaLabel/categorySelect) */}
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>분류</span>
                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
                  disabled={saving || loadingCats}
                >
                  <option value="">{loadingCats ? "불러오는 중..." : "미분류"}</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={String(c.categoryId)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ 내용 (CSS: contentBox/contentTextarea) */}
            <div className={styles.contentBox}>
              <textarea
                className={styles.contentTextarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
                placeholder="내용을 입력하세요."
                rows={12}
              />
            </div>

            <div className={styles.footerRow}>
              <Button variant="secondary" onClick={onCancel} disabled={saving}>
                취소
              </Button>
              <Button variant="primary" onClick={onSave} disabled={!canSubmit}>
                {saving ? "수정 중..." : "수정"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
