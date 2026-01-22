"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/qna-form.module.css";
import type { QnaCategory } from "../types";
import { qnaApi } from "../api/qnaApi";

export default function QnaCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<QnaCategory>("서비스");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    setSaving(true);
    try {
      await qnaApi.create({ title: title.trim(), category, content: content.trim() });
      router.push("/admin/community/qna");
    } catch (e: any) {
      alert(e?.message ?? "등록 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>커뮤니티 - Q&amp;A - 등록</div>
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
          등록
        </button>
      </div>
    </div>
  );
}
