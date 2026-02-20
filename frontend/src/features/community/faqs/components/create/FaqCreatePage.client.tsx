"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./FaqCreatePage.module.css";
import type { Category, CreateFaqRequestDto } from "../../api/types";
import { createFaq, fetchFaqCategories } from "../../api/FaqsApi";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

const LIST_PATH = "/admin/community/faqs";
const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻", "🔗", "🖼️", "▦"];

export default function FaqCreatePageClient() {
  const router = useRouter();
  const t = useI18n("community.faqs.admin.create");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchFaqCategories();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!alive) return;

        setCategories(list);
        if (!categoryId && list.length > 0) setCategoryId(String(list[0].categoryId));
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

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving;
  }, [title, content, saving]);

  const onSubmit = async () => {
    setError("");

    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    if (!normalizedTitle) return setError(t("errors.titleRequired"));
    if (!normalizedContent) return setError(t("errors.contentRequired"));

    const body: CreateFaqRequestDto = {
      title: normalizedTitle,
      content: normalizedContent,
      categoryId: categoryId ? Number(categoryId) : undefined,
    };

    setSaving(true);
    try {
      await createFaq(body);
      router.push(`${LIST_PATH}?toast=created`);
    } catch (e: any) {
      setError(e?.message ?? t("errors.submitFailed"));
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    router.push(LIST_PATH);
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.homeIcon}>&gt;</span>
        <span className={styles.sep}>&gt;</span>
        <strong>{t("breadcrumbTitle")}</strong>
      </div>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{t("title")}</h1>
          <Button variant="secondary" onClick={() => router.push(LIST_PATH)} disabled={saving}>
            {t("buttons.list")}
          </Button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formTable}>
          <div className={styles.row}>
            <div className={styles.labelCell}>{t("labels.title")}</div>
            <div className={styles.contentCell}>
              <div className={styles.titleRow}>
                <input
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("placeholders.title")}
                  disabled={saving}
                  maxLength={200}
                />

                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={saving || loadingCats}
                >
                  <option value="">{loadingCats ? t("placeholders.categoryLoading") : t("placeholders.category")}</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={String(c.categoryId)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.labelCell}>{t("labels.content")}</div>
            <div className={styles.contentCell}>
              <div className={styles.editor}>
                <div className={styles.toolbar}>
                  {TOOLBAR.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      className={styles.toolBtn}
                      onClick={() => {}}
                      disabled={saving}
                      aria-label={tool}
                      title={tool}
                    >
                      {tool}
                    </button>
                  ))}
                </div>

                <textarea
                  className={styles.editorArea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("placeholders.content")}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerRow}>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={!canSubmit}>
            {saving ? t("buttons.creating") : t("buttons.create")}
          </Button>
        </div>
      </div>
    </div>
  );
}
