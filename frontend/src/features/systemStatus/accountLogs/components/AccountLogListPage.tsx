"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../styles/accountLogList.module.css";
import { mockAccounts } from "../data/mockAccountLogs";
import type { AccountSummary } from "../types";

const PAGE_SIZE = 10;

export default function AccountLogListPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const { totalAccounts, loggedInCount } = useMemo(() => {
    const total = mockAccounts.length;
    const loggedIn = mockAccounts.filter((a) => a.status === "LOGGED_IN").length;
    return { totalAccounts: total, loggedInCount: loggedIn };
  }, []);

  const filtered: AccountSummary[] = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return mockAccounts;
    return mockAccounts.filter((a) => {
      const hay = `${a.accountId} ${a.role} ${a.name} ${a.department ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onSearch = () => setPage(1);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.title}>계정 로그 관리</div>

        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="검색어 입력..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button className={styles.searchButton} onClick={onSearch}>
            검색
          </button>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>총 계정 수</div>
          <div className={styles.kpiValue}>{totalAccounts.toLocaleString()}</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>현 로그인중</div>
          <div className={styles.kpiValue}>{loggedInCount.toLocaleString()}</div>
        </div>
      </div>

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
              <tr key={a.accountId} className={styles.row}>
                <td>
                  <Link className={styles.link} href={`/system-status/account-logs/${encodeURIComponent(a.accountId)}`}>
                    {a.accountId}
                  </Link>
                </td>
                <td>{a.role}</td>
                <td>{a.name}</td>
                <td>{a.lastAccessAt}</td>
                <td className={styles.tdRight}>
                  {a.status === "LOGGED_IN" ? (
                    <span className={`${styles.badge} ${styles.badgeOn}`}>로그인중</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeOff}`}>비로그인</span>
                  )}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={5}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button className={styles.pageBtn} disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          &lt;
        </button>

        {Array.from({ length: totalPages }).slice(0, 10).map((_, idx) => {
          const n = idx + 1;
          return (
            <button
              key={n}
              className={`${styles.pageNum} ${n === safePage ? styles.pageNumActive : ""}`}
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
