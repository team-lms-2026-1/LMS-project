"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/qna-list.module.css";
import { mockQna } from "../data/mockQna";
import type { QnaCategory } from "../types";

function badgeClass(category: QnaCategory) {
  switch (category) {
    case "서비스":
      return `${styles.badge} ${styles.badgeService}`;
    case "학습":
      return `${styles.badge} ${styles.badgeStudy}`;
    case "정책":
      return `${styles.badge} ${styles.badgePolicy}`;
    default:
      return `${styles.badge} ${styles.badgeEtc}`;
  }
}

export default function QnaListPage() {
  const router = useRouter();

  const [category, setCategory] = useState<"전체" | QnaCategory>("전체");
  const [keyword, setKeyword] = useState("");

  const rows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return mockQna.filter((q) => {
      const categoryOk = category === "전체" ? true : q.category === category;
      const keywordOk =
        kw.length === 0
          ? true
          : q.title.toLowerCase().includes(kw) || q.content.toLowerCase().includes(kw);
      return categoryOk && keywordOk;
    });
  }, [category, keyword]);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>&gt;</span>
        <strong>Q&amp;A</strong>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>Q&amp;A</div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as "전체" | QnaCategory)}
          >
            <option value="전체">전체</option>
            <option value="서비스">서비스</option>
            <option value="학습">학습</option>
            <option value="정책">정책</option>
            <option value="기타">기타</option>
          </select>

          <input
            className={styles.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력..."
          />

          <button className={styles.searchBtn} onClick={() => {}}>
            검색
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colNo}>번호</th>
              <th className={styles.colCategory}>분류</th>
              <th>제목</th>
              <th className={styles.colAnswer}></th>
              <th className={styles.colViews}>조회수</th>
              <th className={styles.colDate}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={styles.row}
                onClick={() => router.push(`/community/qna/${row.id}`)}
              >
                <td className={styles.colNo}>{row.no}</td>
                <td className={styles.colCategory}>
                  <span className={badgeClass(row.category)}>{row.category}</span>
                </td>
                <td>{row.title}</td>
                <td className={styles.colAnswer}>
                  <span className={styles.answerDot}>{row.answer ? "✓" : ""}</span>
                </td>
                <td className={styles.colViews}>{row.views.toLocaleString()}</td>
                <td className={styles.colDate}>{row.createdAt}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 18, textAlign: "center", color: "#777" }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <button className={styles.leftBtn} onClick={() => alert("카테고리 관리(추후 연결)")}>
          카테고리 관리
        </button>

        <div className={styles.pagination}>
          <button className={`${styles.pageBtn} ${styles.pageBtnDisabled}`} disabled>
            ‹
          </button>
          <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <span style={{ color: "#aaa", fontSize: 12 }}>…</span>
          <button className={styles.pageBtn}>9</button>
          <button className={styles.pageBtn}>10</button>
          <button className={styles.pageBtn}>›</button>
        </div>

        <button className={styles.rightBtn} onClick={() => router.push("/community/qna/new")}>
          등록
        </button>
      </div>
    </div>
  );
}
