"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/faq-form.module.css";
import { faqsApi } from "../api/faqApi";
import { faqCategoriesApi } from "../categories/api/faqCategoriesApi";
import type { FaqCategoryRow } from "../categories/types";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function FaqCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<FaqCategoryRow[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  const categoryValue = useMemo(() => (categoryId == null ? "" : String(categoryId)), [categoryId]);

  useEffect(() => {
    (async () => {
      setLoadingCats(true);
      try {
        const cats = await faqCategoriesApi.list({ page: 0, size: 50 });
        const list = Array.isArray(cats) ? (cats as any) : [];
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
      await faqsApi.create({
        request: {
          title: title.trim(),
          content,
          categoryId,
        },
      });
      router.push("/admin/community/faqs");
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
        <strong>FAQ</strong>
        <span>-</span>
        <span>등록</span>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.pageTitle}>FAQ</div>
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
                    placeholder="질문(제목)"
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

            {/* ✅ FAQ는 첨부파일 섹션 없음 */}
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
