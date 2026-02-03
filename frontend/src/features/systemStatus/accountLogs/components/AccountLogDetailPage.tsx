"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/accountLogDetail.module.css";
import { fetchAccountDetailLogs, downloadAccessLogs } from "../lib/clientApi";
import PrivacyExcelDownloadModal from "./PrivacyExcelDownloadModal";
import type { AccountLogDetailAccount, AccountAccessLogRow } from "../types";

type Props = { accountId: string };

const PAGE_SIZE = 10;

export default function AccountLogDetailPage({ accountId }: Props) {
  const router = useRouter();

  // 날짜 기본값: 오늘 기준 일주일
  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // 상태: 필터 inputs
  const [from, setFrom] = useState(lastWeek);
  const [to, setTo] = useState(today);
  const [keywordInput, setKeywordInput] = useState("");

  // 상태: 실제 조회 조건
  const [page, setPage] = useState(1);
  const [activeParams, setActiveParams] = useState({
    from: lastWeek,
    to: today,
    keyword: ""
  });

  // 데이터
  const [account, setAccount] = useState<AccountLogDetailAccount | null>(null);
  const [logs, setLogs] = useState<AccountAccessLogRow[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // 모달
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 데이터 조회
  const loadData = () => {
    setLoading(true);
    fetchAccountDetailLogs(accountId, {
      page,
      size: PAGE_SIZE,
      from: activeParams.from,
      to: activeParams.to,
      keyword: activeParams.keyword
    })
      .then((res) => {
        if (res.data) {
          setAccount(res.data.header);
          setLogs(res.data.items);
        }
        if (res.meta) {
          setTotalElements(res.meta.totalElements);
        }
      })
      .catch((err) => {
        console.error("Failed to load account logs:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeParams, accountId]);

  const onSearch = () => {
    setPage(1);
    setActiveParams({ from, to, keyword: keywordInput });
  };

  const handleDownload = async (reason: string) => {
    try {
      const blob = await downloadAccessLogs({
        resourceCode: "ACCESS_LOG",
        reason,
        filter: {
          targetAccountId: Number(accountId),
          from: activeParams.from ? `${activeParams.from}T00:00:00` : undefined,
          to: activeParams.to ? `${activeParams.to}T23:59:59` : undefined
        }
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `account_logs_${accountId}_${activeParams.from}_${activeParams.to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("다운로드 실패");
    }
  };

  // Pagination Calc
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  if (loading && !account) {
    return <div className={styles.page}>Loading...</div>;
  }

  if (!account && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          존재하지 않는 계정입니다. (ID: {accountId})
          <button className={styles.backBtn} onClick={() => router.push("/admin/system-status/account-logs")}>목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <div className={styles.breadcrumb}>시스템현황관리 &gt; 계정 로그 관리</div>
          <div className={styles.title}>계정 로그 관리 상세</div>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <div className={styles.summaryCell}>계정 유형: <b>{account?.accountType}</b></div>
        <div className={styles.summaryCell}>이름 : <b>{account?.name}</b></div>
        <div className={styles.summaryCell}>ID : <b>{account?.loginId}</b></div>
        <div className={styles.summaryCell}>소속학과 : <b>{account?.departmentName ?? "-"}</b></div>

        <div className={styles.controls}>
          <input className={styles.dateInput} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className={styles.wave}>~</span>
          <input className={styles.dateInput} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              placeholder="검색어 입력"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
          </div>
          <button className={styles.searchBtn} onClick={onSearch}>검색</button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>번호</th>
              <th>일시</th>
              <th>접속URL</th>
              <th>아이피</th>
              <th>접속환경</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.logId}>
                <td>{l.logId}</td>
                <td>{l.accessedAt ? new Date(l.accessedAt).toLocaleString() : "-"}</td>
                <td>{l.accessUrl}</td>
                <td>{l.ip}</td>
                <td>{l.os}</td>
              </tr>
            ))}

            {!loading && logs.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={5}>
                  로그가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button className={styles.pageBtn} disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>&lt;</button>
        {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
          const n = i + 1;
          return (
            <button key={n} className={`${styles.pageNum} ${n === safePage ? styles.pageNumActive : ""}`} onClick={() => setPage(n)}>{n}</button>
          );
        })}
        <button className={styles.pageBtn} disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>&gt;</button>
      </div>

      <button className={styles.excelBtn} onClick={() => setIsModalOpen(true)}>
        Excel 다운로드
      </button>

      <PrivacyExcelDownloadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmDownload={(reason) => {
          setIsModalOpen(false);
          handleDownload(reason);
        }}
      />
    </div>
  );
}
