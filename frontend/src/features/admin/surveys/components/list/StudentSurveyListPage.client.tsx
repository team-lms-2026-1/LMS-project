"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAvailableSurveys, fetchSurveyTypes } from "@/features/admin/surveys/api/studentSurveysApi";
import { SurveyListItemDto, SurveyTypeResponse } from "@/features/admin/surveys/api/types";
import styles from "./SurveyListPage.client.module.css";
import { Table } from "@/components/table";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";
import { PageMeta } from "../../../curricular/api/types";

const DEFAULT_META: PageMeta = {
    page: 1, size: 10, totalElements: 0, totalPages: 1,
    hasNext: false, hasPrev: false, sort: [],
};

export default function StudentSurveyListPageClient() {
    const tList = useI18n("survey.student.list");
    const tTypes = useI18n("survey.common.types");
    const router = useRouter();

    const [items, setItems] = useState<SurveyListItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<PageMeta>(DEFAULT_META);
    const [type, setType] = useState("");
    const [types, setTypes] = useState<SurveyTypeResponse[]>([]);
    const [typesLoading, setTypesLoading] = useState(false);

    const { page, setPage, keyword, setKeyword } = useListQuery({
        defaultPage: 1,
        defaultSize: 10,
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
        const label = (code: string) => {
            if (code === "SATISFACTION") return tTypes("SATISFACTION");
            if (code === "COURSE") return tTypes("COURSE");
            if (code === "SERVICE") return tTypes("SERVICE");
            if (code === "ETC") return tTypes("ETC");
            return code;
        };
        return types.map(t => ({ value: t.typeCode, label: label(t.typeCode) }));
    }, [types, tTypes]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAvailableSurveys(page, 10, keyword, type);
            setItems(res.data);
            if (res.meta) setMeta(res.meta);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || tList("messages.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [page, keyword, type, tList]);

    useEffect(() => { load(); }, [load]);

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

    const typeLabel = (code: string) => {
        if (code === "SATISFACTION") return tTypes("SATISFACTION");
        if (code === "COURSE") return tTypes("COURSE");
        if (code === "SERVICE") return tTypes("SERVICE");
        if (code === "ETC") return tTypes("ETC");
        return code;
    };

    const columns: TableColumn<SurveyListItemDto>[] = [
        {
            header: tList("table.headers.no"),
            field: "surveyId",
            width: "60px",
            align: "center",
            render: (_, idx) => String(meta.totalElements - (page - 1) * 10 - idx),
        },
        {
            header: tList("table.headers.type"),
            field: "type",
            width: "130px",
            align: "center",
            render: (row) => {
                const colors = SURVEY_TYPE_COLORS[row.type] || SURVEY_TYPE_COLORS.ETC;
                return <Badge bgColor={colors.bg} textColor={colors.text}>{typeLabel(row.type)}</Badge>;
            }
        },
        {
            header: tList("table.headers.title"),
            field: "title",
            align: "center",
            render: (row) => <span style={{ fontWeight: 500 }}>{row.title}</span>
        },
        {
            header: tList("table.headers.deadline"),
            width: "150px",
            align: "center",
            render: (row) => row.endAt ? row.endAt.split(" ")[0] : "-",
        },
        {
            header: tList("table.headers.action"),
            width: "120px",
            align: "center",
            stopRowClick: true,
            render: (row) => (
                <Button
                    variant={row.isSubmitted ? "secondary" : "primary"}
                    onClick={() => !row.isSubmitted && router.push(`/student/surveys/${row.surveyId}`)}
                    disabled={row.isSubmitted}
                >
                    {row.isSubmitted ? tList("table.buttons.done") : tList("table.buttons.participate")}
                </Button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tList("title")}</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={type}
                                options={typeOptions}
                                onChange={(val) => { setPage(1); setType(val); }}
                                placeholder={tList("placeholders.typeAll")}
                                loading={typesLoading}
                                className={styles.dropdownFit}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={inputKeyword}
                                onChange={setInputKeyword}
                                onSearch={handleSearch}
                                placeholder={tList("placeholders.keyword")}
                                className={styles.searchBarFit}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrap}>
                    <Table<SurveyListItemDto>
                        columns={columns}
                        items={items}
                        rowKey={(row) => row.surveyId}
                        loading={loading}
                        skeletonRowCount={10}
                        onRowClick={(row) => !row.isSubmitted && router.push(`/student/surveys/${row.surveyId}`)}
                        emptyText={tList("table.empty")}
                    />
                </div>

                <div className={styles.footerRow}>
                    <PaginationSimple
                        page={page}
                        totalPages={meta.totalPages}
                        onChange={setPage}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}
