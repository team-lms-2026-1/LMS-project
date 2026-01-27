"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/qna-form.module.css";
import type { QnaCategory } from "../types";
import { qnaApi } from "../api/qnaApi";
import type { QnaListItemDto } from "../api/dto";

export default function QnaEditPage({ qnaId }: { qnaId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<QnaListItemDto | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<QnaCategory>("서비스");
  const [content, setContent] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await qnaApi.get(qnaId);
      setItem(data);
      setTitle(data.title ?? "");
      setCategory((data.category ?? "서비스") as QnaCategory);
      setContent(data.content ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Q&A 조회 실패");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qnaId]);

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    setSaving(true);
    try {
      await qnaApi.update(qnaId, { title: title.trim(), category, content: content.trim() });
      router.push(`/admin/community/qna/${qnaId}`);
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!item) return <div className={styles.wrap}>{error ?? "Q&A를 찾을 수 없습니다."}</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>커뮤니티 - Q&amp;A - 수정</div>
      <div className={styles.pageTitle}>Q&amp;A</div>

      <div className={styles.formCard}>
        <div className={styles.row}>
          <div className={styles.label}>제목</div>
          <div className={styles.field}>
            <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>분류</div>
          <div className={styles.field}>
            <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value as QnaCategory)}>
              <option value="서비스">서비스</option>
              <option value="학사">학사</option>
              <option value="행사">행사</option>
              <option value="일반">일반</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>내용</div>
          <div className={styles.field}>
            <textarea className={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </div>
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
