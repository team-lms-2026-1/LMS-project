"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-form.module.css";
import type { ResourceCategory } from "../types";

const TOOLBAR = ["B", "i", "U", "S", "A", "•", "1.", "↺", "↻"];

export default function ResourceCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("서비스");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string>("");

  const onSave = () => {
    router.push("/community/resources");
  };

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
              <th>첨부<br />파일</th>
              <td>
                <div className={styles.attachArea}>
                  <div className={styles.attachTab}>
                    <button type="button" className={styles.tabBtn}>내 PC</button>
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
