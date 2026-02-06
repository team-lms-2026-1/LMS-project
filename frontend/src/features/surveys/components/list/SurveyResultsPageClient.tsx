"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./SurveyListPage.client.module.css";
import { Table } from "@/components/table";
import { TableColumn } from "@/components/table/types";
import { useSurveyList } from "../../hooks/useSurveyList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { StatusPill } from "@/components/status";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";
import { SurveyListItemDto } from "../../api/types";

export default function SurveyResultsPageClient() {
    const router = useRouter();
    const { state, actions } = useSurveyList();

    const { page, setPage, keyword, setKeyword } = useListQuery({
        defaultPage: 1,
        defaultSize: 10
    });

    const [inputKeyword, setInputKeyword] = useState(keyword || "");

    useEffect(() => {
        actions.goPage(page);
    }, [page, actions]);

    useEffect(() => {
        actions.setKeyword(keyword);
    }, [keyword, actions]);

    const handleSearch = useCallback(() => {
        setPage(1);
        actions.goPage(1);
        actions.setKeyword(inputKeyword);
    }, [inputKeyword, setPage, actions]);

    const handleStats = (id: number) => {
        router.push(`/admin/surveys/${id}/stats`);
    };

    const columns: TableColumn<SurveyListItemDto>[] = [
        {
            header: "번호",
            field: "surveyId",
            width: "80px",
            align: "center",
            render: (_, idx) => String((idx + 1) + (page - 1) * state.size).padStart(5, "0"),
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
            align: "left",
            render: (row) => (
                <span style={{ fontWeight: 500 }}>{row.title}</span>
            )
        },
        {
            header: "조회수",
            field: "viewCount",
            width: "100px",
            align: "center",
            render: (row) => row.viewCount?.toLocaleString() || "0",
        },
        {
            header: "기간",
            width: "220px",
            align: "center",
            render: (row) => (
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    {new Date(row.startAt).toLocaleDateString()} ~ {new Date(row.endAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: "결과",
            width: "120px",
            align: "center",
            stopRowClick: true,
            render: (row) => (
                <Button
                    variant="primary"
                    onClick={() => handleStats(row.surveyId)}
                >
                    결과 통계
                </Button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>설문 결과 통계</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchBarWrap}>
                        <SearchBar
                            value={inputKeyword}
                            onChange={setInputKeyword}
                            onSearch={handleSearch}
                            placeholder="설문 제목 검색"
                        />
                    </div>
                </div>

                {state.error && <div className={styles.errorMessage}>{state.error}</div>}

                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        items={state.items}
                        rowKey={(row) => row.surveyId}
                        loading={state.loading}
                        skeletonRowCount={10}
                        onRowClick={(row) => handleStats(row.surveyId)}
                    />
                </div>

                <div className={styles.footerRow}>
                    <PaginationSimple
                        page={page}
                        totalPages={state.meta.totalPages}
                        onChange={setPage}
                        disabled={state.loading}
                    />
                </div>
            </div>
        </div>
    );
}
