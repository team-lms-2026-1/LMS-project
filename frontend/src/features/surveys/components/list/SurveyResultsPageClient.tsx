"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./SurveyListPage.client.module.css";
import { Table } from "@/components/table";
import { TableColumn } from "@/components/table/types";
import { useSurveyList } from "../../hooks/useSurveyList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { StatusPill } from "@/components/status";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useRouter } from "next/navigation";
import { fetchSurveyTypes } from "../../api/surveysApi";
import { SurveyListItemDto, SurveyTypeLabel, SurveyTypeResponse } from "../../api/types";

const SURVEY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    SATISFACTION: { bg: "#eff6ff", text: "#1d4ed8" },
    COURSE: { bg: "#f0fdf4", text: "#15803d" },
    SERVICE: { bg: "#f5f3ff", text: "#7c3aed" },
    ETC: { bg: "#f3f4f6", text: "#374151" },
};

export default function SurveyResultsPageClient() {
    const router = useRouter();
    const { state, actions } = useSurveyList();

    const { page, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

    const [inputKeyword, setInputKeyword] = useState("");
    const [types, setTypes] = useState<SurveyTypeResponse[]>([]);
    const [typesLoading, setTypesLoading] = useState(false);
    const [selectedType, setSelectedType] = useState("");

    useEffect(() => {
        const load = async () => {
            setTypesLoading(true);
            try {
                const res = await fetchSurveyTypes();
                setTypes(res.data);
            } catch (e) {
                console.error("Failed to load survey types", e);
            } finally {
                setTypesLoading(false);
            }
        };
        load();
    }, []);

    const typeOptions = useMemo(() =>
        types.map(t => ({ value: t.typeCode, label: t.typeName })),
        [types]
    );

    useEffect(() => {
        actions.goPage(page);
    }, [page]);

    const handleSearch = useCallback(() => {
        setPage(1);
        actions.setKeyword(inputKeyword);
        actions.search();
    }, [inputKeyword, setPage, actions]);

    const handleTypeChange = useCallback((val: string) => {
        setPage(1);
        setSelectedType(val);
        actions.setType(val);
        actions.search();
    }, [setPage, actions]);

    const handleStats = (id: number) => {
        router.push(`/admin/surveys/${id}/stats`);
    };

    const columns: TableColumn<SurveyListItemDto>[] = [
        {
            header: "번호",
            field: "surveyId",
            width: "60px",
            align: "center",
            render: (_, idx) => String((idx + 1) + (page - 1) * state.size),
        },
        {
            header: "유형",
            field: "type",
            width: "130px",
            align: "center",
            render: (row) => {
                const colors = SURVEY_TYPE_COLORS[row.type] || SURVEY_TYPE_COLORS.ETC;
                return (
                    <Badge bgColor={colors.bg} textColor={colors.text}>
                        {SurveyTypeLabel[row.type] || row.type}
                    </Badge>
                );
            }
        },
        {
            header: "제목",
            field: "title",
            align: "center",
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
            header: "상태",
            field: "status",
            width: "100px",
            align: "center",
            render: (row) => {
                if (row.status === "DRAFT") return <StatusPill status="DRAFT" label="DRAFT" />;
                if (row.status === "CLOSED") return <StatusPill status="INACTIVE" label="CLOSED" />;

                const now = new Date();
                const start = new Date(row.startAt);
                const end = new Date(row.endAt);

                if (now < start) {
                    return <StatusPill status="DRAFT" label="DRAFT" />;
                } else if (now >= start && now <= end) {
                    return <StatusPill status="ACTIVE" label="OPEN" />;
                } else {
                    return <StatusPill status="INACTIVE" label="CLOSED" />;
                }
            }
        },
        {
            header: "결과",
            width: "120px",
            align: "center",
            stopRowClick: true,
            render: (row) => (
                <Button variant="primary" onClick={() => handleStats(row.surveyId)}>
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
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={selectedType}
                                options={typeOptions}
                                onChange={handleTypeChange}
                                placeholder="전체 유형"
                                loading={typesLoading}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={inputKeyword}
                                onChange={setInputKeyword}
                                onSearch={handleSearch}
                                placeholder="설문 제목 검색"
                            />
                        </div>
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
