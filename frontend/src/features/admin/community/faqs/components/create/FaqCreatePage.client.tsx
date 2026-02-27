"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./FaqCreatePage.module.css";
import type { Category, CreateFaqRequestDto } from "../../api/types";
import { createFaq, fetchFaqCategories } from "../../api/FaqsApi";
import { Button } from "@/components/button";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

const LIST_PATH = "/admin/community/faqs";
const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

const clampText = (value: string, max: number) => Array.from(value ?? "").slice(0, max).join("");

export default function FaqCreatePageClient() {
  const router = useRouter();
  const t = useI18n("community.faqs.admin.create");
  const listI18n = useI18n("community.faqs.admin.list");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const allowLeaveRef = useRef(false);

  const isDirty = useMemo(() => {
    return title.trim().length > 0 || content.trim().length > 0 || !!categoryId;
  }, [title, content, categoryId]);

  const toastLeave = useCallback(() => {
    toast.error(t("errors.leaveGuard"));
  }, [t]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchFaqCategories();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!alive) return;

        setCategories(list);
        setCategoryId("");
        setCategoryTouched(false);
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

  useEffect(() => {
    if (allowLeaveRef.current) return;
    if (!isDirty || saving) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, saving]);

  const pushedRef = useRef(false);
  useEffect(() => {
    if (allowLeaveRef.current) return;

    if (!isDirty || saving) {
      pushedRef.current = false;
      return;
    }

    if (!pushedRef.current) {
      history.pushState(null, "", location.href);
      pushedRef.current = true;
    }

    const onPopState = () => {
      if (allowLeaveRef.current) return;
      history.pushState(null, "", location.href);
      toastLeave();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty, saving, toastLeave]);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (allowLeaveRef.current) return;
      if (!isDirty || saving) return;

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
  }, [isDirty, saving, toastLeave]);

  const guardNavigate = useCallback(
    (path: string) => {
      if (allowLeaveRef.current) {
        router.push(path);
        return;
      }
      if (saving) return;
      if (isDirty) {
        toastLeave();
        return;
      }
      router.push(path);
    },
    [router, isDirty, saving, toastLeave]
  );

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
      allowLeaveRef.current = true;
      router.push(`${LIST_PATH}?toast=created`);
    } catch (e: any) {
      setError(e?.message ?? t("errors.submitFailed"));
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    allowLeaveRef.current = true;
    router.push(LIST_PATH);
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumb} onClick={() => guardNavigate(LIST_PATH)}>
          {listI18n("title")}
        </span>
        <span className={styles.sep}>&gt;</span>
        <span className={styles.current}>{t("title")}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{t("title")}</h1>
          <Button variant="secondary" onClick={() => guardNavigate(LIST_PATH)} disabled={saving}>
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
                  onChange={(e) => setTitle(clampText(e.target.value, TITLE_MAX))}
                  placeholder={t("placeholders.title")}
                  disabled={saving}
                  maxLength={TITLE_MAX}
                />

                <select
                  className={styles.categorySelect}
                  value={categoryTouched ? categoryId : ""}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setCategoryTouched(true);
                  }}
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
                <textarea
                  className={styles.editorArea}
                  value={content}
                  onChange={(e) => setContent(clampText(e.target.value, CONTENT_MAX))}
                  placeholder={t("placeholders.content")}
                  disabled={saving}
                  maxLength={CONTENT_MAX}
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
