"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/faq-form.module.css";
import { faqsApi } from "../api/faqApi";
import { faqCategoriesApi } from "../categories/api/faqCategoriesApi";
import type { FaqDetailDto } from "../api/dto";
import type { FaqCategoryRow } from "../categories/types";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function FaqEditPage({ faqId }: { faqId: string }) {
  const router = useRouter();

  const [origin, setOrigin] = useState<FaqDetailDto | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<FaqCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categoryValue = useMemo(() => (categoryId == null ? "" : String(categoryId)), [categoryId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cats = await faqCategoriesApi.list({ page: 0, size: 50 });
        const catList = Array.isArray(cats) ? (cats as any) : [];
        setCategories(catList);

        const data = await faqsApi.detail(faqId);
        setOrigin(data);

        setTitle(data.title ?? "");
        setContent(data.content ?? "");

        const found = catList.find((c: any) => c.name === data.categoryName);
        setCategoryId(found ? Number(found.categoryId) : (catList[0] ? Number(catList[0].categoryId) : null));
      } catch (e: any) {
        alert(e?.message ?? "FAQ 조회 실패");
        setOrigin(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [faqId]);

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!origin) return <div className={styles.wrap}>FAQ를 찾을 수 없습니다.</div>;

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (categoryId == null) return alert("카테고리를 선택하세요.");

    setSaving(true);
    try {
      await faqsApi.update(faqId, {
        request: {
          title: title.trim(),
          content,
          categoryId,
        },
      });

      router.push(`/admin/community/faqs/${faqId}`);
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
        <strong>FAQ</strong>
        <span>-</span>
        <span>수정</span>
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
