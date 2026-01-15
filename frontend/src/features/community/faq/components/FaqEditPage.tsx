"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/faq-form.module.css";
import { mockFaqs } from "../data/mockFaqs";
import type { FaqCategory } from "../types";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function FaqEditPage({ faqId }: { faqId: string }) {
  const router = useRouter();
  const item = mockFaqs.find((f) => f.id === faqId);

  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState<FaqCategory>(item?.category ?? "서비스");
  const [content, setContent] = useState(item?.content ?? "");

  if (!item) return <div className={styles.wrap}>FAQ를 찾을 수 없습니다.</div>;

  const onSave = () => {
    // mock: 실제 PUT/PATCH 없음
    router.push(`/community/faq/${faqId}`);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>FAQ</span>
        <span>-</span>
        <span>상세페이지(수정)</span>
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
          수정
        </button>
      </div>
    </div>
  );
}
