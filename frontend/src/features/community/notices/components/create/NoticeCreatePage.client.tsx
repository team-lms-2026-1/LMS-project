"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./NoticeCreatePage.module.css";
import type { Category, CreateNoticeRequestDto } from "../../api/types";
import { createNotice, fetchNoticeCategories } from "../../api/NoticesApi";
import { Button } from "@/components/button";

const LIST_PATH = "/admin/community/notices";
const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻", "🔗", "🖼️", "▦"];

function toMidnightLocalDateTime(dateOnly: string) {
  if (!dateOnly) return null;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [displayStartAt, setDisplayStartAt] = useState<string>("");
  const [displayEndAt, setDisplayEndAt] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  // ✅ 파일 상태
  const [files, setFiles] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

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
    e.target.value = ""; // 같은 파일 재선택 가능하게
  };

  const removeFile = (key: string) => {
    setFiles((prev) => prev.filter((f) => `${f.name}_${f.size}_${f.lastModified}` !== key));
  };

  const onSubmit = async () => {
    setError("");

    const t = title.trim();
    const c = content.trim();
    if (!t) return setError("제목을 입력하세요.");
    if (!c) return setError("내용을 입력하세요.");

    setSaving(true);
    try {
      // ✅ 파일 있으면: request(JSON) + files 로 multipart 전송 (Postman과 동일)
      if (files.length > 0) {
        const fd = new FormData();

        const payload = {
          categoryId: categoryId ? Number(categoryId) : null,
          title: t,
          content: c,
          displayStartAt: toMidnightLocalDateTime(displayStartAt),
          displayEndAt: toMidnightLocalDateTime(displayEndAt),
        };

        // 핵심: "request" 파트로 JSON을 application/json으로 넣기
        fd.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }));

        for (const f of files) fd.append("files", f);

        const res = await fetch("/api/admin/community/notices", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          let msg = `등록 실패 (${res.status})`;
          try {
            const data = await res.json();
            msg = data?.message ?? msg;
          } catch {
            const text = await res.text().catch(() => "");
            if (text) msg = text;
          }
          throw new Error(msg);
        }
      } else {
        // ✅ 파일 없으면: 기존 JSON 등록 API 사용
        const body: CreateNoticeRequestDto = {
          title: t,
          content: c,
          categoryId: categoryId ? Number(categoryId) : undefined,
          displayStartAt: toMidnightLocalDateTime(displayStartAt),
          displayEndAt: toMidnightLocalDateTime(displayEndAt),
        };

        await createNotice(body);
      }

      router.push(LIST_PATH);
    } catch (e: any) {
      setError(e?.message ?? "등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => router.push(LIST_PATH);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.homeIcon}>⌂</span>
        <span className={styles.sep}>&gt;</span>
        <strong>공지사항 관리</strong>
      </div>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>공지사항 등록</h1>
          <Button variant="secondary" onClick={() => router.push(LIST_PATH)} disabled={saving}>
            목록으로
          </Button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formTable}>
          <div className={styles.row}>
            <div className={styles.labelCell}>제목</div>
            <div className={styles.contentCell}>
              <div className={styles.titleRow}>
                <input
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목"
                  disabled={saving}
                  maxLength={200}
                />

                <select
                  className={styles.categorySelect}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={saving || loadingCats}
                >
                  <option value="">{loadingCats ? "불러오는 중..." : "카테고리 선택"}</option>
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
            <div className={styles.labelCell}>게시기간</div>
            <div className={styles.contentCell}>
              <div className={styles.periodRow}>
                <input
                  type="date"
                  className={styles.date}
                  value={displayStartAt}
                  onChange={(e) => setDisplayStartAt(e.target.value)}
                  disabled={saving}
                />
                <span className={styles.tilde}>~</span>
                <input
                  type="date"
                  className={styles.date}
                  value={displayEndAt}
                  onChange={(e) => setDisplayEndAt(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.labelCell}>내용</div>
            <div className={styles.contentCell}>
              <div className={styles.editor}>
                <div className={styles.toolbar}>
                  {TOOLBAR.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={styles.toolBtn}
                      onClick={() => {}}
                      disabled={saving}
                      aria-label={t}
                      title={t}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <textarea
                  className={styles.editorArea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요."
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.labelCell}>
              첨부
              <br />
              파일
            </div>
            <div className={styles.contentCell}>
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

                {/* ✅ 선택된 파일 목록 표시 */}
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
        </div>

        <div className={styles.footerRow}>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            취소
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={!canSubmit}>
            {saving ? "등록 중..." : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
