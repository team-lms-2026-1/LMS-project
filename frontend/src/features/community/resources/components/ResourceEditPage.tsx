"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-form.module.css";
import type { ResourceListItemDto } from "../api/dto";
import { resourcesApi } from "../api/resourcesApi";
import { resourceCategoriesApi } from "../categories/api/resourceCategoriesApi";
import type { ResourceCategoryDto } from "../categories/api/dto";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function ResourceEditPage({ resourceId }: { resourceId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<ResourceListItemDto | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>(""); // ✅ string
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string>("");

  const [categories, setCategories] = useState<ResourceCategoryDto[]>([]);
  const categoryMap = useMemo(() => {
    const m = new Map<string, ResourceCategoryDto>();
    categories.forEach((c) => m.set(String(c.categoryId), c));
    return m;
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const data = await resourceCategoriesApi.list({ page: 0, size: 200 });
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourcesApi.get(resourceId);
      setItem(data);

      setTitle(data.title ?? "");
      setCategoryId(String(data.categoryId ?? "")); // ✅ string으로 세팅
      setContent((data as any).content ?? ""); // 상세 응답에 content 있으면 사용
      setFileName((data as any).attachment?.name ?? "");
    } catch (e: any) {
      setError(e?.message ?? "자료 조회 실패");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    const cid = Number(categoryId);
    if (!Number.isFinite(cid) || cid <= 0) return alert("카테고리를 선택하세요.");

    setSaving(true);
    try {
      await resourcesApi.update(resourceId, {
        title: title.trim(),
        categoryId: cid, // ✅ number 변환
        content: content.trim(),
      });

      router.push(`/admin/community/resources/${resourceId}`);
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!item) return <div className={styles.wrap}>{error ?? "자료를 찾을 수 없습니다."}</div>;

  const selectedCategory = categoryId ? categoryMap.get(categoryId) : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>자료실</span>
        <span>-</span>
        <span>상세페이지(수정)</span>
      </div>

      <div className={styles.pageTitle}>자료실</div>

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
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.length === 0 ? (
                      <option value="">카테고리가 없습니다</option>
                    ) : (
                      categories.map((c) => (
                        <option key={String(c.categoryId)} value={String(c.categoryId)}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {selectedCategory && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                    선택됨:{" "}
                    <span
                      style={{
                        background: selectedCategory.bgColorHex ,
                        color: selectedCategory.textColorHex ,
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
                  <textarea
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
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
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                        />
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
          수정
        </button>
      </div>
    </div>
  );
}
