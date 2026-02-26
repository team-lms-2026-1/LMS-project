"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./NoticeCreatePage.module.css";
import type { Category, CreateNoticeRequestDto } from "../../api/types";
import { createNotice, fetchNoticeCategories } from "../../api/noticesApi";
import { Button } from "@/components/button";
import { DatePickerInput } from "@/features/admin/authority/semesters/components/ui/DatePickerInput";
import { useI18n } from "@/i18n/useI18n";

const LIST_PATH = "/admin/community/notices";
const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

const clampText = (value: string, max: number) => Array.from(value ?? "").slice(0, max).join("");

function toMidnightLocalDateTime(dateOnly: string) {
  if (!dateOnly) return "";
  return `${dateOnly}T00:00:00`;
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

export default function NoticeCreatePageClient() {
  const router = useRouter();
  const i18n = useI18n("community.notices.admin.create");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [displayStartAt, setDisplayStartAt] = useState("");
  const [displayEndAt, setDisplayEndAt] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // ✅ “성공 이동”은 가드에 막히지 않도록 플래그
  const allowLeaveRef = useRef(false);

  // ✅ 등록 작성 중(이동 가드)
  const isDirty = useMemo(() => {
    return (
      title.trim().length > 0 ||
      content.trim().length > 0 ||
      files.length > 0 ||
      !!displayStartAt ||
      !!displayEndAt ||
      !!categoryId
    );
  }, [title, content, files.length, displayStartAt, displayEndAt, categoryId]);

  const toastLeave = useCallback(() => {
    toast.error(i18n("errors.leaveGuard"));
  }, [i18n]);

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

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchNoticeCategories();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 새로고침/탭 닫기 경고
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

  // ✅ 뒤로가기(popstate) 막고 토스트
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

  // ✅ 링크(<a>) 클릭 가드
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

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving;
  }, [title, content, saving]);

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;

    setFiles((prev) => {
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

  const removeFile = (key: string) => {
    setFiles((prev) => prev.filter((f) => `${f.name}_${f.size}_${f.lastModified}` !== key));
  };

  const onSubmit = async () => {
    const t = title.trim();
    const c = content.trim();

    if (!t) return toast.error(i18n("errors.titleRequired"));
    if (!c) return toast.error(i18n("errors.contentRequired"));
    if (!displayStartAt && !displayEndAt) return toast.error(i18n("errors.periodRequired"));

    const displayStartAtIso = displayStartAt ? toMidnightLocalDateTime(displayStartAt) : "";
    const displayEndAtIso = displayEndAt ? toMidnightLocalDateTime(displayEndAt) : "";

    setSaving(true);
    try {
      if (files.length > 0) {
        const fd = new FormData();
        const payload = {
          categoryId: categoryId ? Number(categoryId) : null,
          title: t,
          content: c,
          displayStartAt: displayStartAtIso,
          displayEndAt: displayEndAtIso,
        };

        fd.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        for (const f of files) fd.append("files", f);

        const res = await fetch("/api/admin/community/notices", { method: "POST", body: fd });

        if (!res.ok) {
          let msg = `${i18n("errors.submitFailed")} (${res.status})`;
          try {
            const data = await res.json();
            msg = data?.message ?? msg;
          } catch {
            const text = await res.text().catch(() => "");
            if (text) msg = text;
          }
          throw new Error(msg);
        }

        // ✅ 성공 응답이 JSON/텍스트여도 문제 없게 한번 소진(선택)
        // await res.text().catch(() => {});
      } else {
        const body: CreateNoticeRequestDto = {
          title: t,
          content: c,
          categoryId: categoryId ? Number(categoryId) : undefined,
          displayStartAt: displayStartAtIso,
          displayEndAt: displayEndAtIso,
        };
        await createNotice(body);
      }

      // ✅ 성공 이동은 가드 무력화
      allowLeaveRef.current = true;

      // ✅ 토스트는 "목록"에서 query로 처리
      router.push(`${LIST_PATH}?toast=created`);
      return;
    } catch (e: any) {
      toast.error(e?.message ?? i18n("errors.submitFailed"));
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
        <span className={styles.homeIcon}>⌂</span>
        <span className={styles.sep}>&gt;</span>
        <strong>{i18n("breadcrumbTitle")}</strong>
      </div>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{i18n("title")}</h1>
          <Button variant="secondary" onClick={() => guardNavigate(LIST_PATH)} disabled={saving}>
            {i18n("buttons.list")}
          </Button>
        </div>

        <div className={styles.formTable}>
          <div className={styles.row}>
            <div className={styles.labelCell}>{i18n("labels.title")}</div>
            <div className={styles.contentCell}>
              <div className={styles.titleRow}>
                <input
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(clampText(e.target.value, TITLE_MAX))}
                  placeholder={i18n("placeholders.title")}
                  disabled={saving}
                  maxLength={TITLE_MAX}
                />

                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={saving || loadingCats}
                >
                  <option value="">
                    {loadingCats ? i18n("placeholders.categoryLoading") : i18n("placeholders.category")}
                  </option>
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
            <div className={styles.labelCell}>{i18n("labels.period")}</div>
            <div className={styles.contentCell}>
              <div className={styles.periodRow}>
                <DatePickerInput
                  value={displayStartAt}
                  onChange={(value) => {
                    setDisplayStartAt(value);
                    if (value && displayEndAt && displayEndAt < value) setDisplayEndAt(value);
                  }}
                  placeholder={i18n("placeholders.startDate")}
                  disabled={saving}
                  className={styles.dateInput}
                />

                <span className={styles.tilde}>~</span>

                <DatePickerInput
                  value={displayEndAt}
                  onChange={setDisplayEndAt}
                  placeholder={i18n("placeholders.endDate")}
                  disabled={saving}
                  min={displayStartAt || undefined}
                  className={styles.dateInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.labelCell}>{i18n("labels.content")}</div>
            <div className={styles.contentCell}>
              <div className={styles.editor}>
                <textarea
                  className={styles.editorArea}
                  value={content}
                  onChange={(e) => setContent(clampText(e.target.value, CONTENT_MAX))}
                  placeholder={i18n("placeholders.content")}
                  disabled={saving}
                  maxLength={CONTENT_MAX}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.labelCell}>
              {i18n("labels.attachment")}
              <br />
              {i18n("labels.file")}
            </div>
            <div className={styles.contentCell}>
              <div className={styles.attachWrap}>
                <div className={styles.attachTabs}>
                  <button
                    type="button"
                    className={styles.tabActive}
                    disabled={saving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {i18n("buttons.myPc")}
                  </button>
                </div>

                <div className={styles.dropzone}>
                  <div className={styles.dropText}>
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

                {files.length > 0 && (
                  <div className={styles.fileList}>
                    {files.map((f) => {
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
                            onClick={() => removeFile(key)}
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
        </div>

        <div className={styles.footerRow}>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            {i18n("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={!canSubmit}>
            {saving ? i18n("buttons.creating") : i18n("buttons.create")}
          </Button>
        </div>
      </div>
    </div>
  );
}
