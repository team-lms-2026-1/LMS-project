"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { useSurveyList } from "@/features/surveys/hooks/useSurveyList";
import { SurveyListResponse } from "@/features/surveys/types";
import { TableColumn } from "@/components/table/types";
import { useState } from "react";
import { Button } from "@/components/button/Button";
import { StatusPill, StatusType } from "@/components/status/StatusPill";

export default function SurveyResultsPage() {
    const router = useRouter();
    const { data, loading, page, setPage, totalPages } = useSurveyList();
    const [searchQuery, setSearchQuery] = useState("");

    const handleStats = (id: number) => {
        router.push(`/admin/surveys/${id}/stats`);
    };

    const columns: TableColumn<SurveyListResponse>[] = [
        {
            header: "번호",
            field: "surveyId",
            width: "80px",
            align: "center",
            render: (_, idx) => String((idx + 1) + (page - 1) * 10).padStart(5, "0"),
        },
        {
            header: "상태",
            field: "status",
            width: "100px",
            align: "center",
            render: (row) => {
                const now = new Date();
                const start = new Date(row.startAt);
                const end = new Date(row.endAt);

                if (now < start) {
                    return <StatusPill status="PENDING" label="대기" />;
                } else if (now >= start && now <= end) {
                    return <StatusPill status="ACTIVE" label="OPEN" />;
                } else {
                    return <StatusPill status="INACTIVE" label="CLOSED" />;
                }
            }
        },
        {
            header: "제목",
            field: "title",
            align: "center",
            render: (row) => (
                <span
                    className={styles.titleLink}
                    onClick={() => handleStats(row.surveyId)}
                >
                    {row.title}
                </span>
            )
        },
        {
            header: "작성일",
            width: "150px",
            align: "center",
            render: (row) => row.createdAt ? row.createdAt.split(" ")[0] : "-",
        },
        {
            header: "기간",
            width: "220px",
            align: "center",
            render: (row) => (
                <>
                    {new Date(row.startAt).toLocaleDateString()} ~ {new Date(row.endAt).toLocaleDateString()}
                </>
            ),
        },
        {
            header: "통계",
            width: "120px",
            align: "center",
            stopRowClick: true,
            render: (row) => (
                <Button
                    variant="primary" // 강조
                    className={styles.statsBtn}
                    onClick={() => handleStats(row.surveyId)}
                >
                    결과 보기
                </Button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>설문 결과 통계</h1>

                <div className={styles.searchRow}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="검색어 입력..."
                        onSearch={() => { }}
                    />
                </div>

                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        items={data}
                        rowKey={(row) => row.surveyId}
                        loading={loading}
                        skeletonRowCount={10}
                        onRowClick={(row) => handleStats(row.surveyId)}
                    />
                </div>

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter}>
                        <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
                    </div>
                    <div className={styles.footerRight} />
                </div>
            </div>
        </div>
    );
}
