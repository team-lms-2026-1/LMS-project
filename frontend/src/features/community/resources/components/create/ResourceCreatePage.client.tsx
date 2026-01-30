"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ResourceCreatePage.module.css";
import type { Category, CreateResourceRequestDto } from "../../api/types";
import { createResource, fetchResourceCategories } from "../../api/ResourcesApi";
import { Button } from "@/components/button";

const LIST_PATH = "/admin/community/resources"; // 

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻", "🔗", "🖼️", "▦"];

function toMidnightLocalDateTime(dateOnly: string) {
  if (!dateOnly) return null;
  return `${dateOnly}T00:00:00`;
}

export default function ResourceCreatePageClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [displayStartAt, setDisplayStartAt] = useState<string>("");
  const [displayEndAt, setDisplayEndAt] = useState<string>("");

  // ✅ 카테고리
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
        const res = await fetchResourceCategories();
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

    const t = title.trim();
    const c = content.trim();
    if (!t) return setError("제목을 입력하세요.");
    if (!c) return setError("내용을 입력하세요.");

    const body: CreateResourceRequestDto = {
      title: t,
      content: c,
      categoryId: categoryId ? Number(categoryId) : undefined,
      displayStartAt: toMidnightLocalDateTime(displayStartAt),
      displayEndAt: toMidnightLocalDateTime(displayEndAt),
    };

    setSaving(true);
    try {
      await createResource(body);
      router.push(LIST_PATH);
    } catch (e: any) {
      setError(e?.message ?? "등록에 실패했습니다.");
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
          {/* 제목 row */}
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
              </div>
            </div>
          </div>

          {/* 내용 row */}
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
            <div className={styles.labelCell}>첨부<br />파일</div>
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
                  <div className={styles.maxSize}>Max size: 50B</div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className={styles.hiddenFile}
                    onChange={() => {}}
                  />
                </div>
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
