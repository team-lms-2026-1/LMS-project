"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../styles/accountLogList.module.css";
import { fetchAccountLogs } from "../lib/clientApi";
import type { AccountLogListItem } from "../types";

const PAGE_SIZE = 10;

type UiAccountRow = {
  accountId: number;
  loginId: string;
  role: string;
  name: string;
  lastAccessAt: string;
  status: "LOGGED_IN" | "LOGGED_OUT";
};

export default function AccountLogListPage() {
  // ✅ 입력창에 바인딩되는 값
  const [keywordInput, setKeywordInput] = useState("");
  // ✅ 실제 서버 검색에 사용되는 값(검색 버튼/엔터로 확정)
  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AccountLogListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [summary, setSummary] = useState({
    totalAccounts: 0,
    onlineAccounts: 0,
  });
  const [loading, setLoading] = useState(true);

  /* ======================
     API 호출 (page, keyword 바뀔 때만)
  ====================== */
  useEffect(() => {
    setLoading(true);

    fetchAccountLogs({ page, size: PAGE_SIZE, keyword })
      .then((res) => {
        setItems(res.data.items);
        setSummary(res.data.summary);
        setTotalElements(res.meta.totalElements);
      })
      .finally(() => setLoading(false));
  }, [page, keyword]);

  /* ======================
     서버 데이터 → UI용 변환 (클라 필터 제거)
  ====================== */
  const rows: UiAccountRow[] = useMemo(() => {
    return items.map<UiAccountRow>((a) => ({
      accountId: a.accountId,
      loginId: a.loginId,
      role: a.accountType,
      name: a.name,
      lastAccessAt: a.lastActivityAt
        ? new Date(a.lastActivityAt).toLocaleString()
        : "-",
      status: a.isOnline ? "LOGGED_IN" : "LOGGED_OUT",
    }));
  }, [items]);

  /* ======================
     페이징 계산
  ====================== */
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const onSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim()); // ✅ 여기서만 서버 검색어 확정
  };

  /* ======================
     렌더링
  ====================== */
  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.headerRow}>
        <div className={styles.title}>계정 로그 관리</div>

        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="아이디 및 이름으로 검색"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button className={styles.searchButton} onClick={onSearch}>
            검색
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>총 계정 수</div>
          <div className={styles.kpiValue}>
            {summary.totalAccounts.toLocaleString()}
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>현 로그인중</div>
          <div className={styles.kpiValue}>
            {summary.onlineAccounts.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>로그인 ID</th>
              <th>계정 유형</th>
              <th>이름</th>
              <th>최근접속 일시</th>
              <th className={styles.thRight}>로그인 유무</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.loginId} className={styles.row}>
                <td>
                  <Link
                    className={styles.link}
                    href={`/admin/system-status/account-logs/${a.accountId}`}
                  >
                    {a.loginId}
                  </Link>
                </td>
                <td>{a.role}</td>
                <td>{a.name}</td>
                <td>{a.lastAccessAt}</td>
                <td className={styles.tdRight}>
                  {a.status === "LOGGED_IN" ? (
                    <span className={`${styles.badge} ${styles.badgeOn}`}>
                      로그인중
                    </span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeOff}`}>
                      비로그인
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={5}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          disabled={safePage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages })
          .slice(0, 10)
          .map((_, idx) => {
            const n = idx + 1;
            return (
              <button
                key={n}
                className={`${styles.pageNum} ${n === safePage ? styles.pageNumActive : ""
                  }`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            );
          })}

        <button
          className={styles.pageBtn}
          disabled={safePage >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
