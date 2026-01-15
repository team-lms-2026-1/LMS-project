"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/faq-form.module.css";
import type { FaqCategory } from "../types";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function FaqCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FaqCategory>("서비스");
  const [content, setContent] = useState("");

  const onSave = () => {
    // mock: 실제 POST 없음
    router.push("/community/faq");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>FAQ</span>
        <span>-</span>
        <span>등록</span>
      </div>

      <div className={styles.pageTitle}>FAQ</div>

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
                    onChange={(e) => setCategory(e.target.value as FaqCategory)}
                  >
                    <option value="서비스">서비스</option>
                    <option value="학습">학습</option>
                    <option value="정책">정책</option>
                    <option value="기타">기타</option>
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
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => router.back()}>
          취소
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave}>
          등록
        </button>
      </div>
    </div>
  );
}
