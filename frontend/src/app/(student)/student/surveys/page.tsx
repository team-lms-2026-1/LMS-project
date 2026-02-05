
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAvailableSurveys } from "@/features/surveys/service/student";
import { SurveyListResponse, SurveyStatus, SurveyTypeLabel } from "@/features/surveys/types";
import styles from "./survey.module.css";
import { Table } from "@/components/table/Table";
import { TableColumn } from "@/components/table/types";
import { StatusPill, StatusType } from "@/components/status/StatusPill";
import { Button } from "@/components/button/Button";
import { SearchBar } from "@/components/searchbar/SearchBar";

export default function StudentSurveyListPage() {
    const router = useRouter();
    const [surveys, setSurveys] = useState<SurveyListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // Input value
    const [keyword, setKeyword] = useState(""); // Actual search trigger

    useEffect(() => {
        setLoading(true);
        fetchAvailableSurveys(keyword)
            .then((data) => setSurveys(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [keyword]); // Refetch when keyword changes

    const handleSearch = () => {
        setKeyword(searchQuery);
    };

    const columns: TableColumn<SurveyListResponse>[] = [
        {
            header: "번호",
            field: "surveyId",
            width: "80px",
            align: "center",
            render: (row, idx) => String(idx + 1).padStart(5, "0"),
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
                    onClick={() => router.push(`/student/surveys/${row.surveyId}`)}
                >
                    {row.title}
                </span>
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
                <>
                    {new Date(row.startAt).toLocaleDateString()} ~ {new Date(row.endAt).toLocaleDateString()}
                </>
            ),
        },
        {
            header: "참여",
            width: "120px",
            align: "center",
            render: (row) => (
                <Link href={`/student/surveys/${row.surveyId}`}>
                    <Button variant="primary" style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}>
                        참여하기
                    </Button>
                </Link>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>설문 목록</h1>

                <div className={styles.searchRow}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="설문 검색"
                        onSearch={handleSearch}
                    />
                </div>

                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        items={surveys}
                        rowKey={(row) => row.surveyId}
                        loading={loading}
                        skeletonRowCount={10}
                        emptyText={keyword ? "검색 결과가 없습니다." : "참여 가능한 설문이 없습니다."}
                        onRowClick={(row) => router.push(`/student/surveys/${row.surveyId}`)}
                    />
                </div>

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter} />
                    <div className={styles.footerRight} />
                </div>
            </div>
        </div>
    );
}
