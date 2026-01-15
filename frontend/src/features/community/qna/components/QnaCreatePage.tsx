"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/qna-form.module.css";
import type { QnaCategory } from "../types";

export default function QnaCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<QnaCategory>("서비스");
  const [content, setContent] = useState("");

  const onSave = () => {
    // mock: 실제 POST 없음
    router.push("/community/qna");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>Q&amp;A</span>
        <span>-</span>
        <span>등록</span>
      </div>

      <div className={styles.pageTitle}>Q&amp;A</div>

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
                    onChange={(e) => setCategory(e.target.value as QnaCategory)}
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
                <textarea
                  className={styles.textarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="질문 내용을 입력하세요..."
                />
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
