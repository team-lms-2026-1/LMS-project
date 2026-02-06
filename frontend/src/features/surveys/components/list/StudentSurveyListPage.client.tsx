"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAvailableSurveys } from "@/features/surveys/api/studentSurveysApi";
import { SurveyListItemDto } from "@/features/surveys/api/types";
import styles from "./SurveyListPage.client.module.css";
import { Table } from "@/components/table";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { Button } from "@/components/button";

export default function StudentSurveyListPageClient() {
    const router = useRouter();
    const [items, setItems] = useState<SurveyListItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);

    const { page, setPage, keyword, setKeyword } = useListQuery({
        defaultPage: 1,
        defaultSize: 10
    });

    const [inputKeyword, setInputKeyword] = useState(keyword || "");

    const load = useCallback(async () => {
        try {
            setErrorMsg(null);
            const res = await fetchAvailableSurveys(page, 10, keyword);
            setItems(res.data);
            if (res.meta) {
                setTotalPages(res.meta.totalPages);
            }
        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "설문 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [page, keyword]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSearch = useCallback(() => {
        setPage(1);
        load(); // Force reload if needed, though useListQuery usually handles URL change
        setKeyword(inputKeyword);
    }, [inputKeyword, setPage, setKeyword, load]);

    const columns: TableColumn<SurveyListItemDto>[] = [
        {
            header: "번호",
            field: "surveyId",
            width: "80px",
            align: "center",
            render: (_, idx) => String((idx + 1) + (page - 1) * 10).padStart(5, "0"),
        },
        {
            header: "유형",
            field: "type",
            width: "120px",
            align: "center",
            render: (row) => {
                switch (row.type) {
                    case "SATISFACTION": return "만족도 조사";
                    case "COURSE": return "강의 설문";
                    case "SERVICE": return "서비스 조사";
                    default: return "기타";
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
            header: "마감기한",
            width: "150px",
            align: "center",
            render: (row) => row.endAt ? row.endAt.split(" ")[0] : "-",
        },
        {
            header: "참여",
            width: "120px",
            align: "center",
            stopRowClick: true,
            render: (row) => (
                <Button
                    variant="primary"
                    onClick={() => router.push(`/student/surveys/${row.surveyId}`)}
                >
                    참여하기
                </Button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>진행 중인 설문</h1>

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

                {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        items={items}
                        rowKey={(row) => row.surveyId}
                        loading={loading}
                        skeletonRowCount={10}
                        onRowClick={(row) => router.push(`/student/surveys/${row.surveyId}`)}
                    />
                </div>

                <div className={styles.footerRow}>
                    <PaginationSimple
                        page={page}
                        totalPages={totalPages}
                        onChange={setPage}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}
