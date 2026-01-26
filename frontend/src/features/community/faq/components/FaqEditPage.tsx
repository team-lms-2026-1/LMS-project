"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/faq-form.module.css";
import type { FaqCategory } from "../types";
import { faqApi } from "../api/faqApi";
import type { FaqListItemDto } from "../api/dto";

export default function FaqEditPage({ faqId }: { faqId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<FaqListItemDto | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FaqCategory>("서비스");
  const [content, setContent] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await faqApi.get(faqId);
      setItem(data);
      setTitle(data.title ?? "");
      setCategory((data.category ?? "서비스") as FaqCategory);
      setContent(data.content ?? "");
    } catch (e: any) {
      setError(e?.message ?? "FAQ 조회 실패");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faqId]);

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    setSaving(true);
    try {
      await faqApi.update(faqId, { title: title.trim(), category, content: content.trim() });
      router.push(`/admin/community/faq/${faqId}`);
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.wrap}>불러오는 중...</div>;
  if (!item) return <div className={styles.wrap}>{error ?? "FAQ를 찾을 수 없습니다."}</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>커뮤니티 - FAQ - 수정</div>
      <div className={styles.pageTitle}>FAQ</div>

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
            <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value as FaqCategory)}>
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
