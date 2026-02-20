"use client";

import { useEffect, useMemo, useRef, useState, forwardRef, useCallback } from "react";
import type { ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./NoticeEditPage.module.css";

import type {
  Category,
  NoticeDetailDto,
  UpdateNoticeRequestDto,
  ExistingFile,
  LoadState,
} from "../../api/types";
import { fetchNoticeCategories, fetchNoticeDetail, updateNotice } from "../../api/noticesApi";
import { Button } from "@/components/button";
import DatePicker from "react-datepicker";
import { useI18n } from "@/i18n/useI18n";

function toMidnightLocalDateTime(dateOnly: string) {
  if (!dateOnly) return "";
  return `${dateOnly}T00:00:00`;
}

function formatYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmdToDate(s?: string | null): Date | null {
  if (!s) return null;
  const ymd = String(s).slice(0, 10);
  const [y, m, d] = ymd.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function normalizeDetail(payload: any): NoticeDetailDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  const displayStartAt =
    raw?.displayStartAt ?? raw?.display_start_at ?? raw?.displayStart ?? raw?.startAt ?? "";

  const displayEndAt =
    raw?.displayEndAt ?? raw?.display_end_at ?? raw?.displayEnd ?? raw?.endAt ?? "";

  return {
    noticeId: Number(raw?.noticeId ?? 0),
    category: raw?.category ?? null,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    status: String(raw?.status ?? ""),
    files: Array.isArray(raw?.files) ? raw.files : [],
    displayStartAt: displayStartAt ? String(displayStartAt) : "",
    displayEndAt: displayEndAt ? String(displayEndAt) : "",
  };
}

function normalizeExistingAttachments(files: any[], fallbackFileName: (index: number) => string): ExistingFile[] {
  if (!Array.isArray(files)) return [];

  return files.map((f: any, idx: number) => {
    const rawId = f?.attachmentId ?? f?.id ?? f?.fileId;
    const attachmentId = rawId == null ? undefined : Number(rawId);
    const safeAttachmentId = Number.isFinite(attachmentId) ? attachmentId : undefined;

    const fileName = String(
      f?.originalName ?? f?.originaName ?? f?.fileName ?? f?.name ?? fallbackFileName(idx + 1)
    );

    const url =
      typeof f?.url === "string"
        ? f.url
        : typeof f?.downloadUrl === "string"
          ? f.downloadUrl
          : typeof f?.fileUrl === "string"
            ? f.fileUrl
            : undefined;

    return { attachmentId: safeAttachmentId, fileName, url };
  });
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const DateTextInput = forwardRef<HTMLInputElement, any>(function DateTextInput(props, ref) {
  return <input ref={ref} {...props} className={styles.date} readOnly />;
});

export default function NoticeEditPageClient() {
  const router = useRouter();
  const i18n = useI18n("community.notices.admin.edit");
  const params = useParams<{ noticeId?: string }>();
  const allowLeaveRef = useRef(false);

  const noticeIdParam = params?.noticeId;
  const noticeId = useMemo(() => Number(noticeIdParam ?? 0), [noticeIdParam]);

  const LIST_PATH = "/admin/community/notices";
  const DETAIL_PATH = `/admin/community/notices/${noticeId}`;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [load, setLoad] = useState<LoadState<NoticeDetailDto>>({
    loading: true,
    error: null,
    data: null,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [displayStartAt, setDisplayStartAt] = useState<Date | null>(null);
  const [displayEndAt, setDisplayEndAt] = useState<Date | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(() => {
    if (!load.data) return false;
    const base = load.data;

    const baseTitle = String(base.title ?? "");
    const baseContent = String(base.content ?? "");
    const baseCat = base.category?.categoryId ? String(base.category.categoryId) : "";

    const baseStart = String(base.displayStartAt ?? "").slice(0, 10);
    const baseEnd = String(base.displayEndAt ?? "").slice(0, 10);

    const curStart = displayStartAt ? formatYmd(displayStartAt) : "";
    const curEnd = displayEndAt ? formatYmd(displayEndAt) : "";

    const changed =
      title !== baseTitle ||
      content !== baseContent ||
      categoryId !== baseCat ||
      curStart !== baseStart ||
      curEnd !== baseEnd ||
      deletedAttachmentIds.length > 0 ||
      newFiles.length > 0;

    return changed;
  }, [load.data, title, content, categoryId, displayStartAt, displayEndAt, deletedAttachmentIds.length, newFiles.length]);

  const toastLeave = useCallback(() => {
    toast.error(i18n("errors.leaveGuard"));
  }, [i18n]);

  useEffect(() => {
    if (!isDirty || saving) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, saving]);

  useEffect(() => {
    if (allowLeaveRef.current) return;
    if (!isDirty || saving) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, saving]);

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

  const pushedRef = useRef(false);
  useEffect(() => {
    if (!isDirty || saving) {
      pushedRef.current = false;
      return;
    }

    if (!pushedRef.current) {
      history.pushState(null, "", location.href);
      pushedRef.current = true;
    }

    const onPopState = () => {
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

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
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

  useEffect(() => {
    if (!noticeId || Number.isNaN(noticeId)) {
      setLoad({ loading: false, error: i18n("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoad({ loading: true, error: null, data: null });
        const res = await fetchNoticeDetail(noticeId);
        const data = normalizeDetail(res);
        if (!alive) return;

        setLoad({ loading: false, error: null, data });

        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setCategoryId(data.category?.categoryId ? String(data.category.categoryId) : "");

        setDisplayStartAt(parseYmdToDate(data.displayStartAt));
        setDisplayEndAt(parseYmdToDate(data.displayEndAt));

        setExistingFiles(
          normalizeExistingAttachments(data.files ?? [], (index) => i18n("texts.attachmentFallback", { index }))
        );
        setDeletedAttachmentIds([]);
        setNewFiles([]);
      } catch (e: any) {
        if (!alive) return;
        setLoad({
          loading: false,
          error: e?.message ?? i18n("errors.loadFailed"),
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [noticeId, i18n]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchNoticeCategories();
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

  const isPeriodValid = useMemo(() => {
    if (displayStartAt && displayEndAt) return displayEndAt >= displayStartAt;
    return true;
  }, [displayStartAt, displayEndAt]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving && !load.loading && isPeriodValid;
  }, [title, content, saving, load.loading, isPeriodValid]);

  const onCancel = () => {
    if (isDirty && !saving) toastLeave();
    router.push(DETAIL_PATH);
  };

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;

    setNewFiles((prev) => {
      const map = new Map(prev.map((f) => [`${f.name}_${f.size}_${f.lastModified}`, f]));
      for (const f of incoming) map.set(`${f.name}_${f.size}_${f.lastModified}`, f);
      return Array.from(map.values());
    });
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    addFiles(list);
    e.target.value = "";
  };

  const removeNewFile = (key: string) => {
    setNewFiles((prev) => prev.filter((f) => `${f.name}_${f.size}_${f.lastModified}` !== key));
  };

  const isDeletedExisting = (f: ExistingFile) => {
    if (typeof f.attachmentId === "number") return deletedAttachmentIds.includes(f.attachmentId);
    return false;
  };

  const toggleDeleteExisting = (f: ExistingFile) => {
    if (typeof f.attachmentId !== "number") {
      toast.error(i18n("errors.missingAttachmentId"));
      return;
    }

    setDeletedAttachmentIds((prev) =>
      prev.includes(f.attachmentId!)
        ? prev.filter((x) => x !== f.attachmentId)
        : [...prev, f.attachmentId!]
    );
  };

  const onSave = async () => {
    const t = title.trim();
    const c = content.trim();

    if (!t) return toast.error(i18n("errors.titleRequired"));
    if (!c) return toast.error(i18n("errors.contentRequired"));
    if (!isPeriodValid) return toast.error(i18n("errors.invalidPeriod"));

    const displayStartAtIso = displayStartAt ? toMidnightLocalDateTime(formatYmd(displayStartAt)) : "";
    const displayEndAtIso = displayEndAt ? toMidnightLocalDateTime(formatYmd(displayEndAt)) : "";

    const body: UpdateNoticeRequestDto = {
      title: t,
      content: c,
      categoryId: categoryId ? Number(categoryId) : undefined,
      displayStartAt: displayStartAtIso,
      displayEndAt: displayEndAtIso,
      deleteFileIds: deletedAttachmentIds,
    };

    setSaving(true);
    try {
      await updateNotice(noticeId, body, newFiles);
      allowLeaveRef.current = true;
      toast.success(i18n("toasts.saveSuccess"));
      router.push(DETAIL_PATH);
    } catch (e: any) {
      toast.error(e?.message ?? i18n("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const data = load.data;

  const selectedCategory = useMemo(() => {
    const fromList =
      categoryId && categories.length ? categories.find((c) => String(c.categoryId) === categoryId) ?? null : null;

    return fromList ?? data?.category ?? null;
  }, [categoryId, categories, data?.category]);

  const badgeStyle = useMemo(() => {
    const bg = selectedCategory?.bgColorHex ?? "#EEF2F7";
    const fg = selectedCategory?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [selectedCategory?.bgColorHex, selectedCategory?.textColorHex]);

  const badgeLabel = selectedCategory?.name ?? i18n("texts.uncategorized");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.breadcrumbRow}>
          <div className={styles.breadcrumb}>
            <span className={styles.crumb} onClick={() => router.push(LIST_PATH)}>
              {i18n("title")}
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>{i18n("breadcrumbCurrent")}</span>
          </div>

          <Button variant="secondary" onClick={() => router.push(LIST_PATH)} disabled={saving}>
            {i18n("buttons.list")}
          </Button>
        </div>

        <h1 className={styles.title}>{i18n("title")}</h1>

        {load.error && <div className={styles.errorMessage}>{load.error}</div>}
        {load.loading && <div className={styles.loadingBox}>{i18n("loading")}</div>}

        {!load.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {badgeLabel}
              </span>

              <input
                className={styles.headTitleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                placeholder={i18n("placeholders.title")}
                maxLength={200}
              />
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{i18n("labels.author")}</span>
                <span className={styles.metaValue}>{data.authorName || "-"}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{i18n("labels.createdAt")}</span>
                <span className={styles.metaValue}>{data.createdAt || "-"}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{i18n("labels.views")}</span>
                <span className={styles.metaValue}>{data.viewCount}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{i18n("labels.category")}</span>
                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={saving || loadingCats}
                >
                  <option value="">
                    {loadingCats ? i18n("placeholders.categoryLoading") : i18n("placeholders.uncategorized")}
                  </option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={String(c.categoryId)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{i18n("labels.period")}</span>
                <div className={styles.periodRow}>
                  <DatePicker
                    selected={displayStartAt}
                    onChange={(d: Date | null) => {
                      setDisplayStartAt(d);
                      if (d && displayEndAt && displayEndAt < d) setDisplayEndAt(d);
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText={i18n("placeholders.startDate")}
                    customInput={<DateTextInput />}
                    disabled={saving}
                    isClearable
                    wrapperClassName={styles.dpWrap}
                    popperPlacement="bottom-start"
                  />
                  <span className={styles.tilde}>~</span>
                  <DatePicker
                    selected={displayEndAt}
                    onChange={(d: Date | null) => setDisplayEndAt(d)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText={i18n("placeholders.endDate")}
                    customInput={<DateTextInput />}
                    disabled={saving}
                    minDate={displayStartAt ?? undefined}
                    isClearable
                    wrapperClassName={styles.dpWrap}
                    popperPlacement="bottom-start"
                  />
                </div>
              </div>
            </div>

            <div className={styles.contentBox}>
              <textarea
                className={styles.contentTextarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
                placeholder={i18n("placeholders.content")}
                rows={12}
              />
            </div>

            <div className={styles.attachBox}>
              <div className={styles.attachRow}>
                <div className={styles.attachLabel}>{i18n("labels.attachment")}</div>

                <div className={styles.attachWrap}>
                  <div className={styles.attachTabs}>
                    <button type="button" className={styles.tabActive} disabled={saving}>
                      {i18n("buttons.myPc")}
                    </button>
                  </div>

                  <div className={styles.dropzone}>
                    <div className={styles.dropText}>
                      {i18n("help.dropPrefix")}{" "}
                      <button
                        type="button"
                        className={styles.uploadLink}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                      >
                        {i18n("buttons.upload")}
                      </button>
                    </div>
                    <div className={styles.maxSize}>{i18n("help.maxSize")}</div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className={styles.hiddenFile}
                      onChange={onFileInputChange}
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.fileList}>
                    {existingFiles.length > 0 ? (
                      existingFiles.map((f, idx) => {
                        const deleted = isDeletedExisting(f);
                        const key = `${f.attachmentId ?? "noid"}_${idx}`;
                        return (
                          <div key={key} className={styles.fileItem}>
                            <div className={styles.fileMeta}>
                              <span
                                className={styles.fileName}
                                style={{
                                  textDecoration: deleted ? "line-through" : "none",
                                  opacity: deleted ? 0.6 : 1,
                                }}
                              >
                                {f.fileName}
                              </span>
                              {f.url ? (
                                <a className={styles.fileLink} href={f.url} target="_blank" rel="noreferrer">
                                  {i18n("buttons.open")}
                                </a>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              className={styles.fileRemove}
                              onClick={() => toggleDeleteExisting(f)}
                              disabled={saving}
                            >
                              {deleted ? i18n("buttons.deleteFileCancel") : i18n("buttons.deleteFile")}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.attachEmpty}>{i18n("texts.noExistingFiles")}</div>
                    )}
                  </div>

                  {newFiles.length > 0 && (
                    <div className={styles.fileList}>
                      {newFiles.map((f) => {
                        const key = `${f.name}_${f.size}_${f.lastModified}`;
                        return (
                          <div key={key} className={styles.fileItem}>
                            <div className={styles.fileMeta}>
                              <span className={styles.fileName}>{f.name}</span>
                              <span className={styles.fileSize}>{formatBytes(f.size)}</span>
                            </div>
                            <button
                              type="button"
                              className={styles.fileRemove}
                              onClick={() => removeNewFile(key)}
                              disabled={saving}
                            >
                              {i18n("buttons.deleteFile")}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.footerRow}>
              <Button variant="secondary" onClick={onCancel} disabled={saving}>
                {i18n("buttons.cancel")}
              </Button>
              <Button variant="primary" onClick={onSave} disabled={!canSubmit}>
                {saving ? i18n("buttons.saving") : i18n("buttons.save")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
