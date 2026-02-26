"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "../styles/accountLogList.module.css";
import { fetchAccountLogs } from "../lib/clientApi";
import type { AccountLogListItem } from "../types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import type { TableColumn } from "@/components/table/types";
import { useI18n } from "@/i18n/useI18n";

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
  const router = useRouter();
  const t = useI18n("systemStatus.accountLogs.list");
  const tCommon = useI18n("systemStatus.accountLogs.common");

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
      .catch((err) => {
        console.error(err);
        toast.error(t("messages.loadFailed"));
      })
      .finally(() => setLoading(false));
  }, [page, keyword, t]);

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

  const getAccountTypeLabel = (accountType: string) => {
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
        return accountType;
    }
  };

  const columns = useMemo<TableColumn<UiAccountRow>[]>(
    () => [
      {
        header: t("table.loginId"),
        field: "loginId",
        // Link 제거: 전체 행 클릭으로 대체
      },
      { header: t("table.accountType"), field: "role", render: (row) => getAccountTypeLabel(row.role) },
      { header: t("table.name"), field: "name" },
      { header: t("table.lastAccessAt"), field: "lastAccessAt" },
      {
        header: t("table.loginState"),
        field: "status",
        align: "right",
        render: (row) =>
          row.status === "LOGGED_IN" ? (
            <StatusPill status="ACTIVE" label={tCommon("loginStatus.LOGGED_IN")} />
          ) : (
            <StatusPill status="INACTIVE" label={tCommon("loginStatus.LOGGED_OUT")} />
          ),
      },
    ],
    [t, tCommon]
  );

  /* ======================
     페이징 계산
  ====================== */
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  const onSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim()); // ✅ 여기서만 서버 검색어 확정
  };

  /* ======================
     렌더링
  ====================== */
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        <div className={styles.searchRow}>
          <SearchBar
            value={keywordInput}
            onChange={setKeywordInput}
            onSearch={onSearch}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        {/* KPI */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>{t("kpi.totalAccounts")}</div>
            <div className={styles.kpiValue}>
              {summary.totalAccounts.toLocaleString()}
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>{t("kpi.onlineAccounts")}</div>
            <div className={styles.kpiValue}>
              {summary.onlineAccounts.toLocaleString()}
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table
            columns={columns}
            items={rows}
            rowKey={(r) => r.accountId}
            loading={loading}
            skeletonRowCount={10}
            emptyText={t("emptyText")}
            onRowClick={(row) => router.push(`/admin/system-status/account-logs/${row.accountId}`)}
          />
        </div>

        <div className={styles.footerRow}>
          <div className={styles.footerLeft} />
          <div className={styles.footerCenter}>
            <PaginationSimple
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
          <div className={styles.footerRight} />
        </div>
      </div>
    </div>
  );
}
