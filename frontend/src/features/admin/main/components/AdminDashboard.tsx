"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status";
import { Table, type TableColumn } from "@/components/table";
import type { NoticeListItemDto } from "@/features/community/notices/api/types";
import { useNoticesList } from "@/features/community/notices/hooks/useNoticeList";
import { fetchAccountLogs } from "@/features/systemStatus/accountLogs/lib/clientApi";
import type { AccountLogListItem } from "@/features/systemStatus/accountLogs/types";
import { useI18n } from "@/i18n/useI18n";
import styles from "./AdminDashboard.module.css";

const ACCOUNT_PAGE_SIZE = 5;

export default function AdminDashboard() {
  const router = useRouter();
  const t = useI18n("mypage.admin.dashboard");
  const [allOnlineAccounts, setAllOnlineAccounts] = useState<AccountLogListItem[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountPage, setAccountPage] = useState(1);
  const { state: noticeState } = useNoticesList();

  useEffect(() => {
    fetchAccountLogs({ page: 1, size: 200 })
      .then((res) => {
        setAllOnlineAccounts(res.data.items.filter((item) => item.isOnline));
      })
      .catch(console.error)
      .finally(() => setAccountsLoading(false));
  }, []);

  const totalAccountPages = Math.max(1, Math.ceil(allOnlineAccounts.length / ACCOUNT_PAGE_SIZE));
  const currentOnlineAccounts = allOnlineAccounts.slice(
    (accountPage - 1) * ACCOUNT_PAGE_SIZE,
    accountPage * ACCOUNT_PAGE_SIZE,
  );

  const getAccountTypeLabel = (accountType: string) => {
    switch (accountType) {
      case "ADMIN":
        return t("accountType.admin");
      case "PROFESSOR":
        return t("accountType.professor");
      case "STUDENT":
        return t("accountType.student");
      case "STAFF":
        return t("accountType.staff");
      default:
        return accountType;
    }
  };

  const accountColumns: Array<TableColumn<AccountLogListItem>> = [
    { header: t("tables.account.headers.loginId"), align: "center", render: (row) => row.loginId },
    { header: t("tables.account.headers.name"), align: "center", render: (row) => row.name },
    {
      header: t("tables.account.headers.accountType"),
      align: "center",
      render: (row) => getAccountTypeLabel(row.accountType),
    },
    {
      header: t("tables.account.headers.lastActivityAt"),
      align: "center",
      render: (row) => (row.lastActivityAt ? new Date(row.lastActivityAt).toLocaleString() : "-"),
    },
    {
      header: t("tables.account.headers.status"),
      align: "center",
      render: () => <StatusPill status="ACTIVE" label={t("tables.account.statusActive")} />,
    },
  ];

  const noticeColumns: Array<TableColumn<NoticeListItemDto>> = [
    { header: t("tables.notice.headers.id"), width: 60, align: "center", render: (row) => row.noticeId },
    {
      header: t("tables.notice.headers.category"),
      width: 120,
      align: "center",
      render: (row) => {
        const category = row.category;
        if (!category) return t("tables.notice.uncategorized");
        return (
          <Badge bgColor={category.bgColorHex} textColor={category.textColorHex}>
            {category.name}
          </Badge>
        );
      },
    },
    {
      header: t("tables.notice.headers.title"),
      align: "left",
      cellClassName: styles.noticeTitleCell,
      title: (row) => row.title,
      render: (row) => <span className={styles.noticeTitleText}>{row.title}</span>,
    },
    { header: t("tables.notice.headers.views"), width: 80, align: "center", render: (row) => row.viewCount },
    { header: t("tables.notice.headers.createdAt"), width: 140, align: "center", render: (row) => row.createdAt },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("sections.onlineAccounts.title")}</h2>
          <Button variant="secondary" onClick={() => router.push("/admin/system-status/account-logs")}>
            {t("sections.onlineAccounts.button")}
          </Button>
        </div>
        <div className={styles.tableWrap}>
          <Table<AccountLogListItem>
            columns={accountColumns}
            items={currentOnlineAccounts}
            loading={accountsLoading}
            rowKey={(row) => row.accountId}
            emptyText={t("tables.account.empty")}
            onRowClick={(row) => router.push(`/admin/system-status/account-logs/${row.accountId}`)}
          />
        </div>
        {allOnlineAccounts.length > 0 && (
          <div className={styles.footerRow}>
            <div className={styles.footerLeft} />
            <div className={styles.footerCenter}>
              <PaginationSimple page={accountPage} totalPages={totalAccountPages} onChange={setAccountPage} />
            </div>
            <div className={styles.footerRight} />
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("sections.notices.title")}</h2>
          <Button variant="secondary" onClick={() => router.push("/admin/community/notices")}>
            {t("sections.notices.button")}
          </Button>
        </div>
        <div className={styles.tableWrap}>
          <Table<NoticeListItemDto>
            columns={noticeColumns}
            items={noticeState.items.slice(0, 5)}
            loading={noticeState.loading}
            rowKey={(row) => row.noticeId}
            emptyText={t("tables.notice.empty")}
            onRowClick={(row) => router.push(`/admin/community/notices/${row.noticeId}`)}
          />
        </div>
      </div>
    </div>
  );
}
