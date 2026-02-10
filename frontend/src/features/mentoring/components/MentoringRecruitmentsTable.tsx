import { useMemo } from "react";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { MentoringRecruitment } from "../api/types";
import styles from "./MentoringRecruitmentsTable.module.css";
import { SelectOption } from "@/features/dropdowns/semesters/types";

type Props = {
    items: MentoringRecruitment[];
    loading: boolean;
    onEdit: (row: MentoringRecruitment) => void;
    onDelete: (id: number) => void;
    semesterOptions: SelectOption[];
};

export function MentoringRecruitmentsTable({ items, loading, onEdit, onDelete, semesterOptions }: Props) {
    const getSemesterLabel = (id: number) => {
        return semesterOptions.find(opt => opt.value === String(id))?.label || `${id}학기`;
    };

    const columns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            { header: "학기", field: "semesterId", render: (row) => getSemesterLabel(row.semesterId) },
            { header: "제목", field: "title" },
            {
                header: "모집기간",
                field: "recruitStartAt",
                render: (row) => {
                    const format = (dt: string) => dt ? dt.replace("T", " ").substring(0, 16) : "-";
                    return `${format(row.recruitStartAt)} ~ ${format(row.recruitEndAt)}`;
                }
            },
            {
                header: "상태",
                field: "status",
                align: "center",
                render: (row) => {
                    const now = new Date();
                    const start = new Date(row.recruitStartAt);
                    const end = new Date(row.recruitEndAt);

                    if (now < start) {
                        return <StatusPill status="PENDING" label="PENDING" />;
                    } else if (now >= start && now <= end) {
                        return <StatusPill status="ACTIVE" label="OPEN" />;
                    } else {
                        return <StatusPill status="INACTIVE" label="CLOSED" />;
                    }
                }
            },
            {
                header: "관리",
                field: "recruitmentId",
                align: "center",
                width: "220px",
                stopRowClick: true,
                render: (row) => (
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                        <Button
                            variant="secondary"
                            onClick={() => onEdit(row)}
                        >
                            수정
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => onDelete(row.recruitmentId)}
                        >
                            삭제
                        </Button>
                    </div>
                )
            }
        ],
        [onEdit, onDelete, semesterOptions]
    );


    return (
        <Table<MentoringRecruitment>
            columns={columns}
            items={items}
            rowKey={(r) => r.recruitmentId}
            loading={loading}
            skeletonRowCount={10}
            emptyText="모집 공고가 없습니다."
        />
    );
}
