"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-list.module.css";
import { mockResources } from "../data/mockResources";
import type { ResourceCategory } from "../types";

function badgeClass(category: ResourceCategory) {
  switch (category) {
    case "서비스":
      return `${styles.badge} ${styles.badgeService}`;
    case "학사":
      return `${styles.badge} ${styles.badgeAcademic}`;
    case "행사":
      return `${styles.badge} ${styles.badgeEvent}`;
    default:
      return `${styles.badge} ${styles.badgeNormal}`;
  }
}

export default function ResourceListPage() {
  const router = useRouter();

  const [category, setCategory] = useState<"전체" | ResourceCategory>("전체");
  const [keyword, setKeyword] = useState("");

  const rows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return mockResources.filter((n) => {
      const categoryOk = category === "전체" ? true : n.category === category;
      const keywordOk = kw.length === 0 ? true : n.title.toLowerCase().includes(kw);
      return categoryOk && keywordOk;
    });
  }, [category, keyword]);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>&gt;</span>
        <strong>자료실 관리</strong>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>자료실</div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as "전체" | ResourceCategory)}
          >
            <option value="전체">전체</option>
            <option value="서비스">서비스</option>
            <option value="학사">학사</option>
            <option value="행사">행사</option>
            <option value="일반">일반</option>
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
              <th className={styles.colViews}>조회수</th>
              <th className={styles.colDate}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={styles.row}
                onClick={() => router.push(`/community/resources/${row.id}`)}
              >
                <td className={styles.colNo}>{row.no}</td>
                <td className={styles.colCategory}>
                  <span className={badgeClass(row.category)}>{row.category}</span>
                </td>
                <td>{row.title}</td>
                <td className={styles.colViews}>{row.views.toLocaleString()}</td>
                <td className={styles.colDate}>{row.createdAt}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: "center", color: "#777" }}>
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

        <button className={styles.rightBtn} onClick={() => router.push("/community/resources/new")}>
          등록
        </button>
      </div>
    </div>
  );
}
