"use client";

import { Table, type TableColumn } from "@/components/table";
import { SurveyListItemDto, SurveyTypeLabel } from "../../api/types";
import { StatusPill } from "@/components/status";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import styles from "./SurveysTable.module.css";

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
    onEditClick: (id: number) => void;
    onDeleteClick: (id: number) => void;
}

export function SurveysTable({ items, loading, page, size, onEditClick, onDeleteClick }: Props) {
    const columns: TableColumn<SurveyListItemDto>[] = [
        {
            header: "번호",
            field: "surveyId",
            width: "60px",
            align: "center",
            render: (_, idx) => String((idx + 1) + (page - 1) * size),
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
            render: (row) => <span>{row.title}</span>
        },
        {
            header: "조회수",
            field: "viewCount",
            width: "100px",
            align: "center",
            render: (row) => row.viewCount?.toLocaleString() || "0",
        },
        {
            header: "작성일",
            width: "120px",
            align: "center",
            render: (row) => row.createdAt ? row.createdAt.split(" ")[0] : "-",
        },
        {
            header: "기간",
            width: "220px",
            align: "center",
            render: (row) => (
                <span className={styles.dateRange}>
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
            header: "관리",
            width: "180px",
            align: "center",
            render: (row) => (
                <div className={styles.actionCell}>
                    <Button
                        variant="secondary"
                        onClick={() => onEditClick(row.surveyId)}
                    >
                        수정
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => onDeleteClick(row.surveyId)}
                    >
                        삭제
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
            emptyText="설문이 없습니다."
        />
    );
}
