"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { StatusPill } from "@/components/status";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { useNoticesList } from "@/features/community/notices/hooks/useNoticeList";
import { fetchAccountLogs } from "@/features/systemStatus/accountLogs/lib/clientApi";
import type { NoticeListItemDto } from "@/features/community/notices/api/types";
import type { AccountLogListItem } from "@/features/systemStatus/accountLogs/types";
import styles from "./AdminDashboard.module.css";
import { useI18n } from "@/i18n/useI18n";

export default function AdminDashboard() {
    const router = useRouter();
    const t = useI18n("systemStatus.accountLogs.common");

    const [allOnlineAccounts, setAllOnlineAccounts] = useState<AccountLogListItem[]>([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [accountPage, setAccountPage] = useState(1);
    const ACCOUNT_PAGE_SIZE = 5;

    // 공지사항 훅을 이용해 데이터 가져오기
    const { state: noticeState } = useNoticesList();

    useEffect(() => {
        // 가장 최근 200건을 가져온 후 현재 로그인 중인 계정(isOnline === true)만 추출
        fetchAccountLogs({ page: 1, size: 200 })
            .then((res) => {
                const loggedIn = res.data.items.filter(item => item.isOnline);
                setAllOnlineAccounts(loggedIn);
            })
            .catch(console.error)
            .finally(() => setAccountsLoading(false));
    }, []);

    const totalAccountPages = Math.max(1, Math.ceil(allOnlineAccounts.length / ACCOUNT_PAGE_SIZE));
    const currentOnlineAccounts = allOnlineAccounts.slice((accountPage - 1) * ACCOUNT_PAGE_SIZE, accountPage * ACCOUNT_PAGE_SIZE);

    const getAccountTypeLabel = (accountType: string) => {
        switch (accountType) {
            case "ADMIN": return t("accountType.ADMIN") || "관리자";
            case "PROFESSOR": return t("accountType.PROFESSOR") || "교수";
            case "STUDENT": return t("accountType.STUDENT") || "학생";
            case "STAFF": return t("accountType.STAFF") || "교직원";
            default: return accountType;
        }
    };

    const accountColumns: Array<TableColumn<AccountLogListItem>> = [
        { header: "로그인 ID", align: "center", render: (r) => r.loginId },
        { header: "이름", align: "center", render: (r) => r.name },
        { header: "계정 유형", align: "center", render: (r) => getAccountTypeLabel(r.accountType) },
        { header: "최근 접속 일시", align: "center", render: (r) => r.lastActivityAt ? new Date(r.lastActivityAt).toLocaleString() : "-" },
        {
            header: "상태",
            align: "center",
            render: () => <StatusPill status="ACTIVE" label="로그인 중" />
        },
    ];

    const noticeColumns: Array<TableColumn<NoticeListItemDto>> = [
        { header: "ID", width: 60, align: "center", render: (r) => r.noticeId },
        {
            header: "카테고리",
            width: 120,
            align: "center",
            render: (r) => {
                const c = r.category;
                if (!c) return "미분류";
                return (
                    <Badge bgColor={c.bgColorHex} textColor={c.textColorHex}>
                        {c.name}
                    </Badge>
                );
            },
        },
        { header: "제목", align: "left", render: (r) => r.title },
        { header: "조회수", width: 80, align: "center", render: (r) => r.viewCount },
        { header: "작성일", width: 140, align: "center", render: (r) => r.createdAt },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>현재 접속 중인 계정 현황</h2>
                    <Button variant="secondary" onClick={() => router.push("/admin/system-status/account-logs")}>
                        계정 로그 관리로 이동
                    </Button>
                </div>
                <div className={styles.tableWrap}>
                    <Table<AccountLogListItem>
                        columns={accountColumns}
                        items={currentOnlineAccounts}
                        loading={accountsLoading}
                        rowKey={(r) => r.accountId}
                        emptyText="현재 접속 중인 계정이 없습니다."
                        onRowClick={(r) => router.push(`/admin/system-status/account-logs/${r.accountId}`)}
                    />
                </div>
                {allOnlineAccounts.length > 0 && (
                    <div className={styles.footerRow}>
                        <div className={styles.footerLeft} />
                        <div className={styles.footerCenter}>
                            <PaginationSimple
                                page={accountPage}
                                totalPages={totalAccountPages}
                                onChange={setAccountPage}
                            />
                        </div>
                        <div className={styles.footerRight} />
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>최근 공지사항</h2>
                    <Button variant="secondary" onClick={() => router.push("/admin/community/notices")}>
                        전체 공지사항 관리
                    </Button>
                </div>
                <div className={styles.tableWrap}>
                    <Table<NoticeListItemDto>
                        columns={noticeColumns}
                        items={noticeState.items.slice(0, 5)} // 최근 공지 5개만 간단히 표시
                        loading={noticeState.loading}
                        rowKey={(r) => r.noticeId}
                        emptyText="등록된 공지사항이 없습니다."
                        onRowClick={(r) => router.push(`/admin/community/notices/${r.noticeId}`)}
                    />
                </div>
            </div>
        </div>
    );
}
