"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ResourceEditPage.module.css";
import type { Category, ResourceListItemDto, ResourceFileDto, ExistingFile, LoadState, } from "../../api/types";
import { fetchResourceCategories, fetchResourceDetail, updateResource } from "../../api/resourcesApi";
import { Button } from "@/components/button";

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

function normalizeExistingFiles(files: any[]): ExistingFile[] {
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
        `첨부파일 ${idx + 1}`
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

export default function ResourceEditPageClient() {
  const router = useRouter();
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
      setLoad({ loading: false, error: "잘못된 자료실 ID입니다.", data: null });
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
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setCategoryId(data.category?.categoryId ? String(data.category.categoryId) : "");

        // ✅ 첨부 초기화
        setExistingFiles(normalizeExistingFiles(data.files ?? []));
        setDeletedFileIds([]);
        setNewFiles([]);
      } catch (e: any) {
        if (!alive) return;
        setLoad({
          loading: false,
          error: e?.message ?? "자료실을 불러오지 못했습니다.",
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [resourceId]);

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
      alert("이 첨부파일은 fileId(또는 id)가 없어 삭제할 수 없습니다. 백엔드 응답에 식별자가 필요합니다.");
      return;
    }
    setDeletedFileIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSave = async () => {
    setFormError("");

    const t = title.trim();
    const c = content.trim();
    if (!t) return setFormError("제목을 입력하세요.");
    if (!c) return setFormError("내용을 입력하세요.");

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
      setFormError(e?.message ?? "수정에 실패했습니다.");
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
              자료실
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>수정페이지</span>
          </div>

          <Button variant="secondary" onClick={() => router.push(LIST_PATH)} disabled={saving}>
            목록으로
          </Button>
        </div>

        <h1 className={styles.title}>자료실</h1>

        {load.error && <div className={styles.errorMessage}>{load.error}</div>}
        {formError && <div className={styles.errorMessage}>{formError}</div>}

        {load.loading && <div className={styles.loadingBox}>불러오는 중...</div>}

        {!load.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {data.category?.name ?? "미분류"}
              </span>

              <input
                className={styles.headTitleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                placeholder="제목"
                maxLength={200}
              />
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성자</span>
                <span className={styles.metaValue}>{data.authorName || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성일</span>
                <span className={styles.metaValue}>{data.createdAt || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>조회수</span>
                <span className={styles.metaValue}>{data.viewCount}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>분류</span>
                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
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

            {/* ✅ 첨부 */}
            <div className={styles.attachBox}>
              <div className={styles.attachRow}>
                <div className={styles.attachLabel}>첨부</div>

                <div className={styles.attachWrap}>
                  <div className={styles.attachTabs}>
                    <button type="button" className={styles.tabActive} disabled={saving}>
                      내 PC
                    </button>
                  </div>

                  <div className={styles.dropzone}>
                    <div className={styles.dropText}>
                      Drop here to attach or{" "}
                      <button
                        type="button"
                        className={styles.uploadLink}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                      >
                        upload
                      </button>
                    </div>
                    <div className={styles.maxSize}>Max size: 50MB</div>

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
                                  열기
                                </a>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              className={styles.fileRemove}
                              onClick={() => toggleDeleteExisting(f)}
                              disabled={saving}
                            >
                              {deleted ? "삭제 취소" : "삭제"}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.attachEmpty}>기존 첨부파일 없음</div>
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
                              삭제
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
