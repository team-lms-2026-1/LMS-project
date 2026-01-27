"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/notice-form.module.css";
import { noticesApi } from "../api/noticesApi";
import { noticeCategoriesApi } from "../categories/api/noticeCategoriesApi";
import type { NoticeCategoryRow } from "../categories/types";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function NoticeCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<NoticeCategoryRow[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  const categoryValue = useMemo(() => (categoryId == null ? "" : String(categoryId)), [categoryId]);

  useEffect(() => {
    (async () => {
      setLoadingCats(true);
      try {
        const cats = await noticeCategoriesApi.list({ page: 0, size: 50 });
        const list = Array.isArray(cats) ? cats : [];
        setCategories(list);
        if (list.length > 0) setCategoryId(Number(list[0].categoryId));
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (categoryId == null) return alert("카테고리를 선택하세요.");

    setSaving(true);
    try {
      await noticesApi.create({
        request: {
          title: title.trim(),
          content,
          categoryId,
        },
        files,
      });
      router.push("/admin/community/notices");
    } catch (e: any) {
      alert(e?.message ?? "등록 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <strong>공지사항</strong>
        <span>-</span>
        <span>등록</span>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.pageTitle}>공지사항</div>
      </div>

      <div className={styles.formCard}>
        <table className={styles.formTable}>
          <tbody>
            <tr>
              <th>제목</th>
              <td>
                <div className={styles.inlineRow}>
                  <input
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목"
                  />
                  <select
                    className={styles.select}
                    value={categoryValue}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                    disabled={loadingCats}
                  >
                    {categories.map((c) => (
                      <option key={String(c.categoryId)} value={String(c.categoryId)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>

            <tr>
              <th>내용</th>
              <td>
                <div className={styles.editorWrap}>
                  <div className={styles.toolbar}>
                    {TOOLBAR.map((t) => (
                      <button key={t} type="button" className={styles.toolBtn} title={t}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <textarea className={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)} />
                </div>
              </td>
            </tr>

            <tr>
              <th>
                첨부
                <br />
                파일
              </th>
              <td>
                <div className={styles.attachArea}>
                  <div className={styles.attachTab}>
                    <button type="button" className={styles.tabBtn}>
                      내 PC
                    </button>
                  </div>

                  <div>
                    <div className={styles.dropzone}>
                      Drop here to attach or{" "}
                      <label style={{ color: "#3b82f6", cursor: "pointer" }}>
                        upload
                        <input
                          type="file"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                        />
                      </label>
                    </div>

                    {files.length > 0 && (
                      <div className={styles.fileName}>
                        {files.map((f) => f.name).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button className={styles.btn} onClick={() => router.back()} disabled={saving}>
          취소
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={saving}>
          등록
        </button>
      </div>
    </div>
  );
}
