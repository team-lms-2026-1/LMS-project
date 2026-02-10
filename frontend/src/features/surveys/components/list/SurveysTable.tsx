"use client";

import { Table, type TableColumn } from "@/components/table";
import { SurveyListItemDto } from "../../api/types";
import { StatusPill } from "@/components/status";
import { Button } from "@/components/button";
import styles from "./SurveysTable.module.css";

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
            width: "80px",
            align: "center",
            render: (_, idx) => String((idx + 1) + (page - 1) * size).padStart(5, "0"),
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
                <span className={styles.titleText} onClick={() => onEditClick(row.surveyId)}>
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
