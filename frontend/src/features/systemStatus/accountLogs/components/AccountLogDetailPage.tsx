"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "../styles/accountLogDetail.module.css";
import { fetchAccountDetailLogs, downloadAccessLogs } from "../lib/clientApi";
import PrivacyExcelDownloadModal from "./PrivacyExcelDownloadModal";
import type { AccountLogDetailAccount, AccountAccessLogRow } from "../types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { Button } from "@/components/button/Button";
import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
import type { TableColumn } from "@/components/table/types";
import { useI18n } from "@/i18n/useI18n";

type Props = { accountId: string };

const PAGE_SIZE = 10;

export default function AccountLogDetailPage({ accountId }: Props) {
  const router = useRouter();
  const t = useI18n("systemStatus.accountLogs.detail");
  const tCommon = useI18n("systemStatus.accountLogs.common");

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

  const getAccountTypeLabel = (accountType: string | undefined) => {
    switch (accountType) {
      case "ADMIN":
        return tCommon("accountType.ADMIN");
      case "PROFESSOR":
        return tCommon("accountType.PROFESSOR");
      case "STUDENT":
        return tCommon("accountType.STUDENT");
      case "STAFF":
        return tCommon("accountType.STAFF");
      default:
        return accountType ?? "-";
    }
  };

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
        toast.error(t("messages.loadFailed"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeParams, accountId, t]);

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
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t("messages.downloadFailed"));
    }
  };

  // Pagination Calc
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  const columns = useMemo<TableColumn<AccountAccessLogRow>[]>(() => [
    { header: t("table.logId"), field: "logId", width: "10%" },
    {
      header: t("table.accessedAt"),
      field: "accessedAt",
      width: "20%",
      render: (row) => row.accessedAt ? new Date(row.accessedAt).toLocaleString() : "-"
    },
    { header: t("table.accessUrl"), field: "accessUrl", width: "40%" },
    { header: t("table.ip"), field: "ip", width: "15%" },
    { header: t("table.os"), field: "os", width: "15%" },
  ], [t]);

  if (loading && !account) {
    return <div className={styles.page}>{t("loading")}</div>;
  }

  if (!account && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          {t("notFound", { accountId })}
          <button className={styles.backBtn} onClick={() => router.push("/admin/system-status/account-logs")}>{t("buttons.backToList")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("title")}</h1>
        </div>

        <div className={styles.summaryBar}>
          <div className={styles.summaryCell}>{t("summary.accountType")} <b>{getAccountTypeLabel(account?.accountType)}</b></div>
          <div className={styles.summaryCell}>{t("summary.name")} <b>{account?.name}</b></div>
          <div className={styles.summaryCell}>{t("summary.loginId")} <b>{account?.loginId}</b></div>
          <div className={styles.summaryCell}>{t("summary.departmentName")} <b>{account?.departmentName ?? "-"}</b></div>

          <div className={styles.controls}>
            <DatePickerInput
              value={from}
              onChange={setFrom}
              placeholder="시작일"
              max={to}
            />
            <span className={styles.wave}>~</span>
            <DatePickerInput
              value={to}
              onChange={setTo}
              placeholder="종료일"
              min={from}
            />

            <SearchBar
              value={keywordInput}
              onChange={setKeywordInput}
              onSearch={onSearch}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table
            columns={columns}
            items={logs}
            rowKey={(r) => r.logId}
            loading={loading}
            skeletonRowCount={10}
            emptyText={t("table.emptyText")}
          />
        </div>

        <div className={styles.footerRow}>
          <div className={styles.footerLeft}>
            <Button variant="secondary" onClick={() => router.push("/admin/system-status/account-logs")}>
              {t("buttons.backToList")}
            </Button>
          </div>
          <div className={styles.footerCenter}>
            <PaginationSimple
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
          <div className={styles.footerRight}>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              {t("buttons.excelDownload")}
            </Button>
          </div>
        </div>
      </div>

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
