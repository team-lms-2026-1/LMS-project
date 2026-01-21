"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/accountLogDetail.module.css";
import { getAccountDetail } from "../data/mockAccountLogs";
import PrivacyExcelDownloadModal from "./PrivacyExcelDownloadModal";
import type { AccountLogListItem } from "../types";

type Props = { accountId: string };

function toCsv(rows: AccountLogRow[]) {
  const EOL = "\r\n";
  const header = ["번호", "일시", "접속URL", "아이피", "접속환경"];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    const needsQuote = /[",\n]/.test(s);
    const safe = s.replace(/"/g, '""');
    return needsQuote ? `"${safe}"` : safe;
  };

  const lines = [
    header.map(escape).join(","),
    ...rows.map((r) => [r.seq, r.at, r.url, r.ip, r.userAgent].map(escape).join(",")),
  ];
  return "\uFEFF" + lines.join(EOL);
}

export default function AccountLogDetailPage({ accountId }: Props) {
  const router = useRouter();
  const detail = getAccountDetail(accountId);

  const [from, setFrom] = useState("2026-01-16");
  const [to, setTo] = useState("2026-01-22");
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    if (!detail) return [];
    const q = keyword.trim().toLowerCase();
    if (!q) return detail.logs;
    return detail.logs.filter((l) => `${l.seq} ${l.at} ${l.url} ${l.ip} ${l.userAgent}`.toLowerCase().includes(q));
  }, [detail, keyword]);

  if (!detail) {
    return (
      <div className={styles.page}>
        <div className={styles.topRow}>
          <div className={styles.title}>계정 로그 관리 상세</div>
        </div>
        <div className={styles.notFound}>
          존재하지 않는 계정입니다.
          <button className={styles.backBtn} onClick={() => router.push("/system-status/account-logs")}>
            목록으로
          </button>
        </div>
      </div>
    );
  }

  const { account } = detail;

  const downloadCsv = () => {
    const csv = toCsv(filteredLogs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `account_logs_${account.accountId}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <div className={styles.breadcrumb}>시스템현황관리 &gt; 계정 로그 관리</div>
          <div className={styles.title}>계정 로그 관리 상세</div>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <div className={styles.summaryCell}><b>{account.role}</b></div>
        <div className={styles.summaryCell}>이름 : <b>{account.name}</b></div>
        <div className={styles.summaryCell}>ID : <b>{account.accountId}</b></div>
        <div className={styles.summaryCell}>소속학과 : <b>{account.department ?? "-"}</b></div>

        <div className={styles.controls}>
          <input className={styles.dateInput} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className={styles.wave}>~</span>
          <input className={styles.dateInput} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <input
            className={styles.searchInput}
            placeholder="검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className={styles.searchBtn} onClick={() => null}>검색</button>
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
            {filteredLogs.map((l) => (
              <tr key={l.seq}>
                <td>{l.seq}</td>
                <td>{l.at}</td>
                <td>{l.url}</td>
                <td>{l.ip}</td>
                <td>{l.userAgent}</td>
              </tr>
            ))}

            {filteredLogs.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={5}>
                  로그가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className={styles.excelBtn} onClick={() => setIsModalOpen(true)}>
        Excel 다운로드
      </button>

      <PrivacyExcelDownloadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmDownload={() => {
          setIsModalOpen(false);
          downloadCsv();
        }}
      />
    </div>
  );
}
