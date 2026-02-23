"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./QnaEditPage.module.css";
import type { Category, QnaDetailDto, UpdateQnaQuestionRequestDto } from "../../api/types";
import { fetchQnaCategories, fetchQnaDetail, updateQnaQuestion } from "../../api/qnasApi";
import { Button } from "@/components/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { useI18n } from "@/i18n/useI18n";

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
  const t = useI18n("community.qna.student.edit");

  const { state: authState } = useAuth();
  const me = authState.me;

  const listPath = "/student/community/qna/questions";
  const detailPath = `/student/community/qna/questions/${questionId}`;

  const [load, setLoad] = useState<LoadState>({ loading: true, error: null, data: null });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>("");

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

  useEffect(() => {
    if (!questionId || Number.isNaN(questionId)) {
      setLoad({ loading: false, error: t("errors.invalidId"), data: null });
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
        setLoad({ loading: false, error: e?.message ?? t("errors.loadFailed"), data: null });
      }
    })();

    return () => {
      alive = false;
    };
  }, [questionId, t]);

  const data = load.data;

  const isMine = useMemo(() => {
    if (!data || !me) return false;

    const byLogin = !!data.authorLoginId && !!me.loginId && String(data.authorLoginId) === String(me.loginId);
    const byId =
      typeof data.authorId === "number" &&
      typeof (me as any).accountId === "number" &&
      data.authorId === (me as any).accountId;

    return byLogin || byId;
  }, [data, me]);

  useEffect(() => {
    if (!load.loading && data && me && !isMine) {
      alert(t("errors.ownerOnlyAlert"));
      router.replace(detailPath);
    }
  }, [load.loading, data, me, isMine, router, detailPath, t]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving && !load.loading && isMine;
  }, [title, content, saving, load.loading, isMine]);

  const onCancel = () => router.push(detailPath);

  const onSave = async () => {
    setFormError("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) return setFormError(t("errors.titleRequired"));
    if (!trimmedContent) return setFormError(t("errors.contentRequired"));
    if (!isMine) return setFormError(t("errors.ownerOnlyAlert"));

    const body: UpdateQnaQuestionRequestDto = {
      title: trimmedTitle,
      content: trimmedContent,
      categoryId: categoryId ? Number(categoryId) : null,
    };

    setSaving(true);
    try {
      await updateQnaQuestion(questionId, body);
      router.push(`${detailPath}?toast=updated`);
      router.refresh();
    } catch (e: any) {
      setFormError(e?.message ?? t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

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
        <div className={styles.breadcrumb}>
          <span className={styles.crumb} onClick={() => router.push(listPath)}>
            Q&A
          </span>
          <span className={styles.sep}>›</span>
          <span className={styles.current}>{t("breadcrumbCurrent")}</span>
        </div>

        <h1 className={styles.title}>{t("title")}</h1>

        {load.error && <div className={styles.errorMessage}>{load.error}</div>}
        {formError && <div className={styles.errorMessage}>{formError}</div>}

        {load.loading && <div className={styles.loadingBox}>{t("loading")}</div>}

        {!load.loading && data && (
          <div className={styles.formBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {selectedCategory?.name ?? t("uncategorized")}
              </span>

              <input
                className={styles.titleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                placeholder={t("placeholders.title")}
                maxLength={200}
              />
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.category")}</span>
                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
                  disabled={saving || loadingCats}
                >
                  <option value="">
                    {loadingCats ? t("placeholders.categoryLoading") : t("placeholders.uncategorized")}
                  </option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={String(c.categoryId)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.contentBox}>
              <textarea
                className={styles.contentTextarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
                placeholder={t("placeholders.content")}
                rows={12}
              />
            </div>

            <div className={styles.footerRow}>
              <Button variant="secondary" onClick={onCancel} disabled={saving}>
                {t("buttons.cancel")}
              </Button>
              <Button variant="primary" onClick={onSave} disabled={!canSubmit}>
                {saving ? t("buttons.saving") : t("buttons.save")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
