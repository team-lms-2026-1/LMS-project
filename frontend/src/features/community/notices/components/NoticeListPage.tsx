"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/notice-list.module.css";
import type { NoticeCategory } from "../types";
import { noticesApi } from "../api/noticesApi";
import type { NoticeListItemDto } from "../api/dto";

function badgeClass(category: NoticeCategory) {
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

export default function NoticeListPage() {
  const router = useRouter();

  const [category, setCategory] = useState<"전체" | NoticeCategory>("전체");
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState<NoticeListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticesApi.list({ category, keyword, page: 0, size: 20 });
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "공지사항 목록 조회 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 최초 로딩
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    // 서버에서 필터를 하더라도, 화면 상태 일관성을 위해 프론트에서도 한 번 더 적용
    const kw = keyword.trim().toLowerCase();
    return rows.filter((n) => {
      const categoryOk = category === "전체" ? true : n.category === category;
      const keywordOk = kw.length === 0 ? true : n.title.toLowerCase().includes(kw);
      return categoryOk && keywordOk;
    });
  }, [rows, category, keyword]);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>&gt;</span>
        <strong>공지사항 관리</strong>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>공지사항</div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as "전체" | NoticeCategory)}
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

          <button className={styles.searchBtn} onClick={fetchList} disabled={loading}>
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
            {loading && (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: "center", color: "#777" }}>
                  불러오는 중...
                </td>
              </tr>
            )}

            {!loading &&
              filteredRows.map((row, idx) => (
                <tr
                  key={String(row.id)}
                  className={styles.row}
                  onClick={() => router.push(`/community/notices/${row.id}`)}
                >
                  <td className={styles.colNo}>{row.no ?? String(idx + 1).padStart(5, "0")}</td>
                  <td className={styles.colCategory}>
                    <span className={badgeClass(row.category)}>{row.category}</span>
                  </td>
                  <td>{row.title}</td>
                  <td className={styles.colViews}>{Number(row.views ?? 0).toLocaleString()}</td>
                  <td className={styles.colDate}>{row.createdAt}</td>
                </tr>
              ))}

            {!loading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: "center", color: "#777" }}>
                  {error ? error : "검색 결과가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <button className={styles.leftBtn} onClick={() => router.push("/admin/community/notices/categories")}>
          카테고리 관리
        </button>

        <div className={styles.pagination}>
          {/* 실제 page/size 적용은 백엔드 스펙 확정 후 연결 */}
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

        <button className={styles.rightBtn} onClick={() => router.push("/community/notices/new")}>
          등록
        </button>
      </div>
    </div>
  );
}
