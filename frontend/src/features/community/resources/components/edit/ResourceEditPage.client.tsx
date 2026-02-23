"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ResourceEditPage.module.css";
import type { Category, ResourceListItemDto, ResourceFileDto, ExistingFile, LoadState, } from "../../api/types";
import { fetchResourceCategories, fetchResourceDetail, updateResource } from "../../api/resourcesApi";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";

function normalizeDetail(payload: any): ResourceListItemDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    resourceId: Number(raw?.resourceId ?? 0),
    category: raw?.category ?? null,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    files: Array.isArray(raw?.files) ? raw.files : [],
  };
}

function normalizeExistingFiles(files: any[], fallbackFileName: (index: number) => string): ExistingFile[] {
  if (!Array.isArray(files)) return [];

  return files.map((f: any, idx: number) => {
    const dto = f as ResourceFileDto;

    const rawId = (dto as any)?.fileId ?? (dto as any)?.id ?? (dto as any)?.attachmentId;
    const parsed = rawId == null ? undefined : Number(rawId);
    const fileId = Number.isFinite(parsed) ? parsed : undefined;

    const fileName = String(
      (dto as any)?.originalName ??
      (dto as any)?.originaName ??
      (dto as any)?.fileName ??
      (dto as any)?.name ??
      fallbackFileName(idx + 1)
    );

    const url =
      typeof (dto as any)?.url === "string"
        ? (dto as any).url
        : typeof (dto as any)?.downloadUrl === "string"
          ? (dto as any).downloadUrl
          : typeof (dto as any)?.fileUrl === "string"
            ? (dto as any).fileUrl
            : undefined;

    return { fileId, fileName, url };
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

const TITLE_MAX = 100;
const CONTENT_MAX = 2000;
const clampText = (value: string, max: number) => Array.from(value ?? "").slice(0, max).join("");

export default function ResourceEditPageClient() {
  const router = useRouter();
  const i18n = useI18n("community.resources.admin.edit");
  const params = useParams<{ resourceId?: string }>();
  const resourceId = useMemo(() => Number(params?.resourceId ?? 0), [params]);

  const LIST_PATH = "/admin/community/resources";
  const DETAIL_PATH = `/admin/community/resources/${resourceId}`;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [load, setLoad] = useState<LoadState<ResourceListItemDto>>({
    loading: true,
    error: null,
    data: null,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 카테고리
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  // ✅ 첨부 관련 상태
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // 상세 로드
  useEffect(() => {
    if (!resourceId || Number.isNaN(resourceId)) {
      setLoad({ loading: false, error: i18n("errors.invalidId"), data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoad({ loading: true, error: null, data: null });
        const res = await fetchResourceDetail(resourceId);
        const data = normalizeDetail(res);
        if (!alive) return;

        setLoad({ loading: false, error: null, data });

        // 초기값
        setTitle(clampText(data.title ?? "", TITLE_MAX));
        setContent(clampText(data.content ?? "", CONTENT_MAX));
        setCategoryId(data.category?.categoryId ? String(data.category.categoryId) : "");

        // ✅ 첨부 초기화
        setExistingFiles(
          normalizeExistingFiles(data.files ?? [], (index) => i18n("texts.attachmentFallback", { index }))
        );
        setDeletedFileIds([]);
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
  }, [resourceId, i18n]);

  // 카테고리 목록
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchResourceCategories();
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

  const onCancel = () => router.push(DETAIL_PATH);

  // ===== ✅ 새 파일 추가/삭제 =====
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

  // ===== ✅ 기존 파일 삭제 토글 =====
  const isDeletedExisting = (f: ExistingFile) =>
    typeof f.fileId === "number" ? deletedFileIds.includes(f.fileId) : false;

  const toggleDeleteExisting = (f: ExistingFile) => {
    const id = f.fileId;
    if (typeof id !== "number") {
      alert(i18n("errors.missingFileId"));
      return;
    }
    setDeletedFileIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSave = async () => {
    setFormError("");

    const t = title.trim();
    const c = content.trim();
    if (!t) return setFormError(i18n("errors.titleRequired"));
    if (!c) return setFormError(i18n("errors.contentRequired"));

    // ✅ 새 파일이 있을 때만 files 파트를 보냄
    const filesToSend = newFiles.length > 0 ? newFiles : undefined;

    setSaving(true);
    try {
      const res = await updateResource(
        resourceId,
        {
          title: t,
          content: c,
          categoryId: categoryId ? Number(categoryId) : undefined,
          deleteFileIds: deletedFileIds,
        },
        filesToSend
      );

      const nextId =
        (res as any)?.data?.resourceId != null ? Number((res as any).data.resourceId) : resourceId;

      router.push(`/admin/community/resources/${nextId}?toast=updated`);
    } catch (e: any) {
      setFormError(e?.message ?? i18n("errors.saveFailed"));
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
        {formError && <div className={styles.errorMessage}>{formError}</div>}

        {load.loading && <div className={styles.loadingBox}>{i18n("loading")}</div>}

        {!load.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {data.category?.name ?? i18n("texts.uncategorized")}
              </span>

              <input
                className={styles.headTitleInput}
                value={title}
                onChange={(e) => setTitle(clampText(e.target.value, TITLE_MAX))}
                disabled={saving}
                placeholder={i18n("placeholders.title")}
                maxLength={TITLE_MAX}
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
                  <option value="">{loadingCats ? i18n("placeholders.categoryLoading") : i18n("placeholders.uncategorized")}</option>
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
                placeholder={i18n("placeholders.content")}
                rows={12}
                maxLength={CONTENT_MAX}
              />
            </div>

            {/* ✅ 첨부 */}
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

                  {/* ✅ 기존 첨부파일 목록 */}
                  <div className={styles.fileList}>
                    {existingFiles.length > 0 ? (
                      existingFiles.map((f, idx) => {
                        const deleted = isDeletedExisting(f);
                        const key = `${f.fileId ?? "noid"}_${idx}`;
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

                  {/* ✅ 새로 선택한 파일 목록 */}
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
