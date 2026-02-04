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
            render: (row) => (
                <StatusPill status={row.status as StatusType} />
            )
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
            render: (row) => (
                <Button
                    variant="primary" // 강조
                    className={styles.statsBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStats(row.surveyId);
                    }}
                >
                    결과 보기
                </Button>
            )
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>설문 결과 통계</h1>
                <div className={styles.searchWrapper}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="검색어 입력..."
                        onSearch={() => { }}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <Table
                    columns={columns}
                    items={data}
                    rowKey={(row) => row.surveyId}
                    loading={loading}
                    onRowClick={(row) => handleStats(row.surveyId)}
                />
            </div>

            <div className={styles.paginationWrapper}>
                <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
            </div>
        </div>
    );
}
