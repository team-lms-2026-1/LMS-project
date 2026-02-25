"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./FaqEditPage.module.css";
import type { Category, FaqListItemDto, LoadState, UpdateFaqRequestDto } from "../../api/types";
import { fetchFaqCategories, fetchFaqDetail, updateFaq } from "../../api/FaqsApi";
import { Button } from "@/components/button";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

function normalizeDetail(payload: any): FaqListItemDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    faqId: Number(raw?.faqId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    status: String(raw?.status ?? ""),
  };
}

const TITLE_MAX = 100;
const CONTENT_MAX = 2000;
const clampText = (value: string, max: number) => Array.from(value ?? "").slice(0, max).join("");

export default function FaqEditPageClient() {
  const router = useRouter();
  const t = useI18n("community.faqs.admin.edit");
  const params = useParams<{ faqId?: string }>();
  const faqId = useMemo(() => Number(params?.faqId ?? 0), [params]);

  const LIST_PATH = "/admin/community/faqs";
  const DETAIL_PATH = `/admin/community/faqs/${faqId}`;

  const [load, setLoad] = useState<LoadState<FaqListItemDto>>({ loading: true, error: null, data: null });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const allowLeaveRef = useRef(false);

  const isDirty = useMemo(() => {
    if (!load.data) return false;
    const base = load.data;
    const baseTitle = String(base.title ?? "");
    const baseContent = String(base.content ?? "");
    const baseCat = base.category?.categoryId ? String(base.category.categoryId) : "";

    return title !== baseTitle || content !== baseContent || categoryId !== baseCat;
  }, [load.data, title, content, categoryId]);

  const toastLeave = useCallback(() => {
    toast.error(t("errors.leaveGuard"));
  }, [t]);

  useEffect(() => {
    if (!faqId || Number.isNaN(faqId)) {
      setLoad({ loading: false, error: t("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoad({ loading: true, error: null, data: null });
        const res = await fetchFaqDetail(faqId);
        const data = normalizeDetail(res);
        if (!alive) return;

        setLoad({ loading: false, error: null, data });
        setTitle(clampText(data.title ?? "", TITLE_MAX));
        setContent(clampText(data.content ?? "", CONTENT_MAX));
        setCategoryId(data.category?.categoryId ? String(data.category.categoryId) : "");
      } catch (e: any) {
        if (!alive) return;
        setLoad({
          loading: false,
          error: e?.message ?? t("errors.loadFailed"),
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [faqId, t]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchFaqCategories();
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

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving && !load.loading;
  }, [title, content, saving, load.loading]);

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

  const onCancel = () => {
    allowLeaveRef.current = true;
    router.push(DETAIL_PATH);
  };

  const onSave = async () => {
    setFormError("");

    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    if (!normalizedTitle) return setFormError(t("errors.titleRequired"));
    if (!normalizedContent) return setFormError(t("errors.contentRequired"));

    const body: UpdateFaqRequestDto = {
      title: normalizedTitle,
      content: normalizedContent,
      categoryId: categoryId ? Number(categoryId) : undefined,
    };

    setSaving(true);
    try {
      await updateFaq(faqId, body);
      allowLeaveRef.current = true;
      toast.success(t("toasts.saveSuccess"));
      router.push(DETAIL_PATH);
    } catch (e: any) {
      setFormError(e?.message ?? t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const data = load.data;

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumbRow}>
          <div className={styles.breadcrumb}>
            <span className={styles.crumb} onClick={() => guardNavigate(LIST_PATH)}>
              {t("title")}
            </span>
            <span className={styles.sep}>&gt;</span>
            <span className={styles.current}>{t("breadcrumbCurrent")}</span>
          </div>

          <Button variant="secondary" onClick={() => guardNavigate(LIST_PATH)} disabled={saving}>
            {t("buttons.list")}
          </Button>
        </div>

        <h1 className={styles.title}>{t("title")}</h1>

        {load.error && <div className={styles.errorMessage}>{load.error}</div>}
        {formError && <div className={styles.errorMessage}>{formError}</div>}

        {load.loading && <div className={styles.loadingBox}>{t("loading")}</div>}

        {!load.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {data.category?.name ?? t("texts.uncategorized")}
              </span>

              <input
                className={styles.headTitleInput}
                value={title}
                onChange={(e) => setTitle(clampText(e.target.value, TITLE_MAX))}
                disabled={saving}
                placeholder={t("placeholders.title")}
                maxLength={TITLE_MAX}
              />
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.author")}</span>
                <span className={styles.metaValue}>{data.authorName || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.createdAt")}</span>
                <span className={styles.metaValue}>{data.createdAt || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.views")}</span>
                <span className={styles.metaValue}>{data.viewCount}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t("labels.category")}</span>
                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={saving || loadingCats}
                >
                  <option value="">{loadingCats ? t("placeholders.categoryLoading") : t("placeholders.uncategorized")}</option>
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
                onChange={(e) => setContent(clampText(e.target.value, CONTENT_MAX))}
                disabled={saving}
                placeholder={t("placeholders.content")}
                rows={12}
                maxLength={CONTENT_MAX}
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
