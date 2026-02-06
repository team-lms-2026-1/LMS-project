"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./NoticeEditPage.module.css";
import type { Category, NoticeListItemDto } from "../../api/types";
import { fetchNoticeCategories, fetchNoticeDetail, updateNotice } from "../../api/NoticesApi";
import { Button } from "@/components/button";

/** ✅ 이 화면 내부에서만 쓰는 "기존 첨부" 타입: attachmentId 기반 */
type ExistingAttachment = {
  attachmentId?: number;
  fileName: string;
  url?: string;
};

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: NoticeListItemDto | null };

function normalizeDetail(payload: any): NoticeListItemDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    noticeId: Number(raw?.noticeId ?? raw?.noticeId ?? raw?.noticeId ?? 0),
    category: raw?.category ?? null,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    status: String(raw?.status ?? ""),
    files: Array.isArray(raw?.files) ? raw.files : [],
  };
}

/** ✅ 백엔드 files 항목에서 attachmentId 추출 */
function normalizeExistingAttachments(files: any[]): ExistingAttachment[] {
  if (!Array.isArray(files)) return [];

  return files.map((f: any, idx: number) => {
    // ✅ attachmentId가 number/string 어떤 타입이든 숫자로 강제 변환
    const rawId = f?.attachmentId ?? f?.id ?? f?.fileId;
    const attachmentId = rawId == null ? undefined : Number(rawId);
    const safeAttachmentId = Number.isFinite(attachmentId) ? attachmentId : undefined;

    // ✅ 백엔드 오타(originaName)까지 흡수
    const fileName = String(
      f?.originalName ?? f?.originaName ?? f?.fileName ?? f?.name ?? `첨부파일 ${idx + 1}`
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

export default function NoticeEditPageClient() {
  const router = useRouter();
  const params = useParams<{ noticeId?: string }>();
  const noticeId = useMemo(() => Number(params?.noticeId ?? 0), [params]);

  const LIST_PATH = "/admin/community/notices";
  const DETAIL_PATH = `/admin/community/notices/${noticeId}`;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [load, setLoad] = useState<LoadState>({ loading: true, error: null, data: null });

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 카테고리
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  // ✅ 첨부 관련 상태 (attachmentId 기반)
  const [existingFiles, setExistingFiles] = useState<ExistingAttachment[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // 상세 로드
  useEffect(() => {
    if (!noticeId || Number.isNaN(noticeId)) {
      setLoad({ loading: false, error: "잘못된 공지사항 ID입니다.", data: null });
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

        // 초기값 세팅
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setCategoryId(data.category?.categoryId ? String(data.category.categoryId) : "");

        // ✅ 기존 첨부 세팅 + 변경 상태 초기화
        setExistingFiles(normalizeExistingAttachments(data.files ?? []));
        setDeletedAttachmentIds([]);
        setNewFiles([]);
      } catch (e: any) {
        if (!alive) return;
        setLoad({
          loading: false,
          error: e?.message ?? "공지사항을 불러오지 못했습니다.",
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [noticeId]);

  // 카테고리 목록 로드
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

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving && !load.loading;
  }, [title, content, saving, load.loading]);

  const onCancel = () => {
    router.push(DETAIL_PATH);
  };

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

  // ===== ✅ 기존 파일 삭제 토글 (attachmentId 기반) =====
  const isDeletedExisting = (f: ExistingAttachment) => {
    if (typeof f.attachmentId === "number") return deletedAttachmentIds.includes(f.attachmentId);
    return false;
  };

  const toggleDeleteExisting = (f: ExistingAttachment) => {
    if (typeof f.attachmentId !== "number") {
      alert("이 첨부파일은 attachmentId가 없어 삭제할 수 없습니다. 백엔드 응답에 attachmentId가 필요합니다.");
      return;
    }

    setDeletedAttachmentIds((prev) =>
      prev.includes(f.attachmentId!) ? prev.filter((x) => x !== f.attachmentId) : [...prev, f.attachmentId!]
    );
  };

  const onSave = async () => {
    setFormError("");

    const t = title.trim();
    const c = content.trim();
    if (!t) return setFormError("제목을 입력하세요.");
    if (!c) return setFormError("내용을 입력하세요.");

    const hasFileChanges = newFiles.length > 0 || deletedAttachmentIds.length > 0;

    setSaving(true);
    try {
      // ✅ 백엔드가 deleteFileIds로 받으니까 attachmentId 값을 그대로 넣어준다
      await updateNotice(
        noticeId,
        {
          title: t,
          content: c,
          categoryId: categoryId ? Number(categoryId) : undefined,
          deleteFileIds: deletedAttachmentIds,
        } as any,
        hasFileChanges ? newFiles : undefined
      );

      router.push(DETAIL_PATH);
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
              공지사항
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>수정페이지</span>
          </div>

          <Button variant="secondary" onClick={() => router.push(LIST_PATH)} disabled={saving}>
            목록으로
          </Button>
        </div>

        <h1 className={styles.title}>공지사항</h1>

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
