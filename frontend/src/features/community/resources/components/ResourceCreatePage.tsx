"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-form.module.css";
import { resourcesApi } from "../api/resourcesApi";
import { resourceCategoriesApi } from "../categories/api/resourceCategoriesApi";
import type { ResourceCategoryDto } from "../categories/api/dto";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function ResourceCreatePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string>("");

  const [categories, setCategories] = useState<ResourceCategoryDto[]>([]);
  const categoryMap = useMemo(() => {
    const m = new Map<string, ResourceCategoryDto>();
    categories.forEach((c) => m.set(String(c.categoryId), c));
    return m;
  }, [categories]);

  useEffect(() => {
    (async () => {
      try {
        const data = await resourceCategoriesApi.list({ page: 0, size: 200 });
        setCategories(data);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    const cid = Number(categoryId);
    if (!Number.isFinite(cid) || cid <= 0) return alert("카테고리를 선택하세요.");

    setSaving(true);
    try {
      const resp = await resourcesApi.create({
        title: title.trim(),
        categoryId: cid,
        content: content.trim(),
      });

      const createdId = resourcesApi.extractCreatedId(resp);
      if (createdId) {
        router.push(`/admin/community/resources/${createdId}`);
      } else {
        router.push(`/admin/community/resources`);
      }
    } catch (e: any) {
      alert(e?.message ?? "등록 실패");
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = categoryId ? categoryMap.get(categoryId) : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>자료실</span>
        <span>-</span>
        <span>등록</span>
      </div>

      <div className={styles.pageTitle}>자료실</div>

      <div className={styles.formCard}>
        <table className={styles.formTable}>
          <tbody>
            <tr>
              <th>제목</th>
              <td>
                <div className={styles.inlineRow}>
                  <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />

                  <select className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">카테고리 선택</option>
                    {categories.map((c) => (
                      <option key={String(c.categoryId)} value={String(c.categoryId)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                    선택됨:{" "}
                    <span
                      style={{
                        background: selectedCategory.bgColorHex,
                        color: selectedCategory.textColorHex,
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {selectedCategory.name}
                    </span>
                  </div>
                )}
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
                첨부<br />파일
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
                        <input type="file" style={{ display: "none" }} onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                      </label>
                    </div>
                    {fileName && <div className={styles.fileName}>{fileName}</div>}
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
          등록
        </button>
      </div>
    </div>
  );
}
