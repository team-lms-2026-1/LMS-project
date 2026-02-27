"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./QnaCreatePage.module.css";
import type { Category, CreateQnaQuestionRequestDto } from "../../api/types";
import { createQnaQuestion, fetchQnaCategories } from "../../api/qnasApi";
import { useI18n } from "@/i18n/useI18n";

const LIST_PATH = "/student/community/qna/questions";
const TITLE_MAX = 190;
const CONTENT_MAX = 2000;

const clampText = (value: string, max: number) => Array.from(value ?? "").slice(0, max).join("");

export default function QnaCreatePageClient() {
  const router = useRouter();
  const t = useI18n("community.qna.student.create");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const aliveRef = useRef(true);
  const loadingCatsRef = useRef(false);
  const lastLoadedAtRef = useRef(0);

  useEffect(() => {
    // React strict mode can run effects twice in dev.
    // Ensure aliveRef is true on mount.
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const loadCategories = useCallback(async (opts?: { force?: boolean }) => {
    if (loadingCatsRef.current) return;
    const now = Date.now();
    if (!opts?.force && now - lastLoadedAtRef.current < 5000) return;

    loadingCatsRef.current = true;
    setLoadingCats(true);
    try {
      const res = await fetchQnaCategories();
      const list = Array.isArray(res?.data) ? res.data : [];
      if (!aliveRef.current) return;
      setCategories(list);
      setCategoryId((prev) => {
        const prevId = prev ?? "";
        const hasPrev = prevId && list.some((c) => String(c.categoryId) === String(prevId));
        if (hasPrev) return prevId;
        return "";
      });
    } catch {
      if (!aliveRef.current) return;
      setCategories([]);
    } finally {
      if (aliveRef.current) {
        setLoadingCats(false);
      }
      loadingCatsRef.current = false;
      lastLoadedAtRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    void loadCategories({ force: true });
  }, [loadCategories]);

  useEffect(() => {
    const handleFocus = () => {
      void loadCategories();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadCategories();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadCategories]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !!categoryId && !saving;
  }, [title, content, categoryId, saving]);

  const onSubmit = async () => {
    setError("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) return setError(t("errors.titleRequired"));
    if (!trimmedContent) return setError(t("errors.contentRequired"));
    if (!categoryId) return setError(t("errors.categoryRequired"));

    const body: CreateQnaQuestionRequestDto = {
      title: trimmedTitle,
      content: trimmedContent,
      categoryId: Number(categoryId),
    };

    setSaving(true);
    try {
      await createQnaQuestion(body);
      router.push(`${LIST_PATH}?toast=created`);
    } catch (e: any) {
      setError(e?.message ?? t("errors.submitFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>{t("title")}</h1>

          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push(LIST_PATH)}
            disabled={saving}
          >
            {t("buttons.list")}
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label}>{t("labels.category")}</div>
            <select
              className={styles.select}
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
              }}
              disabled={saving || loadingCats}
            >
              <option value="">
                {loadingCats ? t("placeholders.categoryLoading") : t("placeholders.category")}
              </option>
              {categories.map((c) => (
                <option key={c.categoryId} value={String(c.categoryId)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>{t("labels.title")}</div>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(clampText(e.target.value, TITLE_MAX))}
              placeholder={t("placeholders.title")}
              disabled={saving}
              maxLength={TITLE_MAX}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>{t("labels.content")}</div>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(clampText(e.target.value, CONTENT_MAX))}
              placeholder={t("placeholders.content")}
              disabled={saving}
              rows={12}
              maxLength={CONTENT_MAX}
            />
          </div>

          <div className={styles.footerRow}>
            <button type="button" className={styles.submitBtn} onClick={onSubmit} disabled={!canSubmit}>
              {saving ? t("buttons.submitting") : t("buttons.submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
