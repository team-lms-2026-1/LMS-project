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
import { SurveyListItemDto, SurveyTypeResponse } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";

const SURVEY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    SATISFACTION: { bg: "#eff6ff", text: "#1d4ed8" },
    COURSE: { bg: "#f0fdf4", text: "#15803d" },
    SERVICE: { bg: "#f5f3ff", text: "#7c3aed" },
    ETC: { bg: "#f3f4f6", text: "#374151" },
};

export default function SurveyResultsPageClient() {
    const tResults = useI18n("survey.admin.results");
    const tTable = useI18n("survey.admin.table");
    const tStatus = useI18n("survey.common.status");
    const tTypes = useI18n("survey.common.types");
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

    const typeOptions = useMemo(() => {
        const typeLabel = (typeCode: string) => {
            if (typeCode === "SATISFACTION") return tTypes("SATISFACTION");
            if (typeCode === "COURSE") return tTypes("COURSE");
            if (typeCode === "SERVICE") return tTypes("SERVICE");
            if (typeCode === "ETC") return tTypes("ETC");
            return typeCode;
        };

        return types.map(t => ({ value: t.typeCode, label: typeLabel(t.typeCode) }));
    }, [types, tTypes]);

    const typeLabel = (typeCode: string) => {
        if (typeCode === "SATISFACTION") return tTypes("SATISFACTION");
        if (typeCode === "COURSE") return tTypes("COURSE");
        if (typeCode === "SERVICE") return tTypes("SERVICE");
        if (typeCode === "ETC") return tTypes("ETC");
        return typeCode;
    };

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
            header: tTable("headers.no"),
            field: "surveyId",
            width: "60px",
            align: "center",
            render: (_, idx) => String(state.meta.totalElements - (page - 1) * state.size - idx),
        },
        {
            header: tTable("headers.type"),
            field: "type",
            width: "130px",
            align: "center",
            render: (row) => {
                const colors = SURVEY_TYPE_COLORS[row.type] || SURVEY_TYPE_COLORS.ETC;
                return (
                    <Badge bgColor={colors.bg} textColor={colors.text}>
                        {typeLabel(row.type)}
                    </Badge>
                );
            }
        },
        {
            header: tTable("headers.title"),
            field: "title",
            align: "center",
            render: (row) => (
                <span style={{ fontWeight: 500 }}>{row.title}</span>
            )
        },
        {
            header: tTable("headers.views"),
            field: "viewCount",
            width: "100px",
            align: "center",
            render: (row) => row.viewCount?.toLocaleString() || "0",
        },
        {
            header: tTable("headers.period"),
            width: "220px",
            align: "center",
            render: (row) => (
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    {new Date(row.startAt).toLocaleDateString()} ~ {new Date(row.endAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: tTable("headers.status"),
            field: "status",
            width: "100px",
            align: "center",
            render: (row) => {
                if (row.status === "DRAFT") return <StatusPill status="DRAFT" label={tStatus("DRAFT")} />;
                if (row.status === "CLOSED") return <StatusPill status="INACTIVE" label={tStatus("CLOSED")} />;

                const now = new Date();
                const start = new Date(row.startAt);
                const end = new Date(row.endAt);

                if (now < start) {
                    return <StatusPill status="DRAFT" label={tStatus("DRAFT")} />;
                } else if (now >= start && now <= end) {
                    return <StatusPill status="ACTIVE" label={tStatus("OPEN")} />;
                } else {
                    return <StatusPill status="INACTIVE" label={tStatus("CLOSED")} />;
                }
            }
        },
        {
            header: tResults("table.result"),
            width: "120px",
            align: "center",
            stopRowClick: true,
            render: (row) => (
                <Button variant="primary" onClick={() => handleStats(row.surveyId)}>
                    {tResults("table.resultButton")}
                </Button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tResults("title")}</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={selectedType}
                                options={typeOptions}
                                onChange={handleTypeChange}
                                placeholder={tResults("placeholders.typeAll")}
                                loading={typesLoading}
                                className={styles.dropdownFit}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={inputKeyword}
                                onChange={setInputKeyword}
                                onSearch={handleSearch}
                                placeholder={tResults("placeholders.keyword")}
                                className={styles.searchBarFit}
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
                        emptyText={tTable("empty")}
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
