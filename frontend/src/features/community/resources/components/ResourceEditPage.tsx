"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-form.module.css";
import type { ResourceCategory, ResourceItem } from "../types";
import { resourcesApi } from "../api/resourcesApi";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function ResourceEditPage({ resourceId }: { resourceId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<ResourceItem | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("서비스");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string>("");

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourcesApi.get(resourceId);
      setItem(data);

      setTitle(data.title ?? "");
      setCategory((data.category ?? "서비스") as ResourceCategory);
      setContent(data.content ?? "");
      setFileName(data.attachment?.name ?? "");
    } catch (e: any) {
      setError(e?.message ?? "자료 조회 실패");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    setSaving(true);
    try {
      await resourcesApi.update(resourceId, {
        title: title.trim(),
        category,
        content: content.trim(),
      });

      // ✅ 현재 app 라우트가 /admin/community/resoures 기준
      router.push(`/admin/community/resoures/${resourceId}`);
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!item) return <div className={styles.wrap}>{error ?? "자료를 찾을 수 없습니다."}</div>;

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
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                  >
                    <option value="서비스">서비스</option>
                    <option value="학사">학사</option>
                    <option value="행사">행사</option>
                    <option value="일반">일반</option>
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
