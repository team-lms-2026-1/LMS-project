"use client";

import { Table, type TableColumn } from "@/components/table";
import { SurveyListItemDto } from "../../api/types";
import { StatusPill } from "@/components/status";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import styles from "./SurveysTable.module.css";
import { useI18n } from "@/i18n/useI18n";

const SURVEY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    SATISFACTION: { bg: "#eff6ff", text: "#1d4ed8" },
    COURSE: { bg: "#f0fdf4", text: "#15803d" },
    SERVICE: { bg: "#f5f3ff", text: "#7c3aed" },
    ETC: { bg: "#f3f4f6", text: "#374151" },
};

interface Props {
    items: SurveyListItemDto[];
    loading: boolean;
    page: number;
    size: number;
    totalCount: number;
    onEditClick: (id: number) => void;
    onDeleteClick: (id: number) => void;
}

export function SurveysTable({ items, loading, page, size, totalCount, onEditClick, onDeleteClick }: Props) {
    const tTable = useI18n("survey.admin.table");
    const tTypes = useI18n("survey.common.types");
    const tStatus = useI18n("survey.common.status");

    const typeLabel = (type: string) => {
        if (type === "SATISFACTION") return tTypes("SATISFACTION");
        if (type === "COURSE") return tTypes("COURSE");
        if (type === "SERVICE") return tTypes("SERVICE");
        if (type === "ETC") return tTypes("ETC");
        return type;
    };

    const columns: TableColumn<SurveyListItemDto>[] = [
        {
            header: tTable("headers.no"),
            field: "surveyId",
            width: "60px",
            align: "center",
            render: (_, idx) => String(totalCount - (page - 1) * size - idx),
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
            render: (row) => <span>{row.title}</span>
        },
        {
            header: tTable("headers.views"),
            field: "viewCount",
            width: "100px",
            align: "center",
            render: (row) => row.viewCount?.toLocaleString() || "0",
        },
        {
            header: tTable("headers.createdAt"),
            width: "120px",
            align: "center",
            render: (row) => row.createdAt ? row.createdAt.split(" ")[0] : "-",
        },
        {
            header: tTable("headers.period"),
            width: "220px",
            align: "center",
            render: (row) => (
                <span className={styles.dateRange}>
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
            header: tTable("headers.manage"),
            width: "180px",
            align: "center",
            render: (row) => (
                <div className={styles.actionCell}>
                    <Button
                        variant="secondary"
                        onClick={() => onEditClick(row.surveyId)}
                    >
                        {tTable("buttons.edit")}
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => onDeleteClick(row.surveyId)}
                    >
                        {tTable("buttons.delete")}
                    </Button>
                </div>
            ),
            stopRowClick: true,
        },
    ];

    return (
        <Table<SurveyListItemDto>
            columns={columns}
            items={items}
            rowKey={(row) => row.surveyId}
            loading={loading}
            skeletonRowCount={10}
            onRowClick={(row) => onEditClick(row.surveyId)}
            emptyText={tTable("empty")}
        />
    );
}
