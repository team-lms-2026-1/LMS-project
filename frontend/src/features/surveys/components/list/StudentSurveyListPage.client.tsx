"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAvailableSurveys, fetchSurveyTypes } from "@/features/surveys/api/studentSurveysApi";
import { SurveyListItemDto, SurveyTypeResponse, SurveyTypeLabel } from "@/features/surveys/api/types";
import styles from "./SurveyListPage.client.module.css";
import { Table } from "@/components/table";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import toast from "react-hot-toast";

export default function StudentSurveyListPageClient() {
    const router = useRouter();
    const [items, setItems] = useState<SurveyListItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [type, setType] = useState("");
    const [types, setTypes] = useState<SurveyTypeResponse[]>([]);
    const [typesLoading, setTypesLoading] = useState(false);

    const { page, setPage, keyword, setKeyword } = useListQuery({
        defaultPage: 1,
        defaultSize: 10
    });

    const [inputKeyword, setInputKeyword] = useState(keyword || "");

    useEffect(() => {
        const loadTypes = async () => {
            setTypesLoading(true);
            try {
                const res = await fetchSurveyTypes();
                setTypes(res.data);
            } catch (e) {
                console.error("Failed to load types", e);
            } finally {
                setTypesLoading(false);
            }
        };
        loadTypes();
    }, []);

    const typeOptions = useMemo(() => {
        return types.map(t => ({
            value: t.typeCode,
            label: t.typeName
        }));
    }, [types]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAvailableSurveys(page, 10, keyword, type);
            setItems(res.data);
            if (res.meta) {
                setTotalPages(res.meta.totalPages);
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "설문 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [page, keyword, type]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSearch = useCallback(() => {
        setPage(1);
        setKeyword(inputKeyword);
    }, [inputKeyword, setPage, setKeyword]);

    const SURVEY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
        SATISFACTION: { bg: "#eff6ff", text: "#1d4ed8" },
        COURSE: { bg: "#f0fdf4", text: "#15803d" },
        SERVICE: { bg: "#f5f3ff", text: "#7c3aed" },
        ETC: { bg: "#f3f4f6", text: "#374151" },
    };

    const columns: TableColumn<SurveyListItemDto>[] = [
        {
            header: "번호",
            field: "surveyId",
            width: "60px",
            align: "center",
            render: (_, idx) => String((idx + 1) + (page - 1) * 10),
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
                    variant={row.isSubmitted ? "secondary" : "primary"}
                    onClick={() => !row.isSubmitted && router.push(`/student/surveys/${row.surveyId}`)}
                    disabled={row.isSubmitted}
                >
                    {row.isSubmitted ? "완료" : "참여하기"}
                </Button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>진행 중인 설문</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={type}
                                options={typeOptions}
                                onChange={(val) => {
                                    setPage(1);
                                    setType(val);
                                }}
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


                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        items={items}
                        rowKey={(row) => row.surveyId}
                        loading={loading}
                        skeletonRowCount={10}
                        onRowClick={(row) => !row.isSubmitted && router.push(`/student/surveys/${row.surveyId}`)}
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
