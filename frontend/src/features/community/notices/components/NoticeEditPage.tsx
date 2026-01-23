"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/notice-form.module.css";
import { noticesApi } from "../api/noticesApi";
import { noticeCategoriesApi } from "../categories/api/noticeCategoriesApi";
import type { NoticeDetailDto } from "../api/dto";
import type { NoticeCategoryRow } from "../categories/types";
import type { NoticeFile } from "../types";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function NoticeEditPage({ noticeId }: { noticeId: string }) {
  const router = useRouter();

  const [origin, setOrigin] = useState<NoticeDetailDto | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<NoticeCategoryRow[]>([]);
  const [existingFiles, setExistingFiles] = useState<NoticeFile[]>([]);
  const [deleteFileIds, setDeleteFileIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categoryValue = useMemo(() => (categoryId == null ? "" : String(categoryId)), [categoryId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cats = await noticeCategoriesApi.list({ page: 0, size: 50 });
        const catList = Array.isArray(cats) ? cats : [];
        setCategories(catList);

        const data = await noticesApi.detail(noticeId);
        setOrigin(data);

        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setExistingFiles(Array.isArray(data.files) ? data.files : []);
        setDeleteFileIds([]);
        setNewFiles([]);

        // ✅ name -> id 매핑(백엔드 상세가 categoryName만 내려오므로)
        const found = catList.find((c) => c.name === data.categoryName);
        setCategoryId(found ? Number(found.categoryId) : (catList[0] ? Number(catList[0].categoryId) : null));
      } catch (e: any) {
        alert(e?.message ?? "공지사항 조회 실패");
        setOrigin(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [noticeId]);

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!origin) return <div className={styles.wrap}>공지사항을 찾을 수 없습니다.</div>;

  const toggleDelete = (fileId: number) => {
    setDeleteFileIds((prev) => (prev.includes(fileId) ? prev.filter((x) => x !== fileId) : [...prev, fileId]));
  };

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (categoryId == null) return alert("카테고리를 선택하세요.");

    setSaving(true);
    try {
      await noticesApi.update(noticeId, {
        request: {
          title: title.trim(),
          content,
          categoryId,
          deleteFileIds,
        },
        files: newFiles,
      });

      router.push(`/admin/community/notices/${noticeId}`);
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
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
        <span>수정</span>
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
                {/* 기존 첨부 */}
                {existingFiles.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>기존 파일</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {existingFiles.map((f, idx) => {
                        const fid = Number(f.fileId ?? -1);
                        const deletable = Number.isFinite(fid) && fid > 0;
                        const marked = deletable && deleteFileIds.includes(fid);

                        return (
                          <div key={`${fid}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              {f.originalName ?? f.fileName ?? `파일 ${idx + 1}`}
                            </div>
                            {deletable ? (
                              <button
                                type="button"
                                className={styles.btn}
                                onClick={() => toggleDelete(fid)}
                                disabled={saving}
                              >
                                {marked ? "삭제취소" : "삭제"}
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: "#9ca3af" }}>fileId 없음</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 신규 첨부 */}
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
                          onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
                        />
                      </label>
                    </div>

                    {newFiles.length > 0 && (
                      <div className={styles.fileName}>
                        {newFiles.map((f) => f.name).join(", ")}
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
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => router.back()} disabled={saving}>
          취소
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={saving}>
          수정
        </button>
      </div>
    </div>
  );
}
