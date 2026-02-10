import { useMemo } from "react";
import { Table, type TableColumn } from "@/components/table";
import { StatusPill } from "@/components/status";
import { MentoringApplication } from "../api/types";

type Props = {
    items: MentoringApplication[];
    loading: boolean;
    onRowClick?: (item: MentoringApplication) => void;
};

export function MentoringApplicationsTable({ items, loading, onRowClick }: Props) {
    const columns = useMemo<TableColumn<MentoringApplication>[]>(
        () => [
            { header: "이름", field: "name", render: (a) => a.name || a.loginId },
            {
                header: "역할",
                field: "role",
                render: (a) => (
                    <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: a.role === "MENTOR" ? "#eff6ff" : "#f0fdf4",
                        color: a.role === "MENTOR" ? "#1e40af" : "#166534"
                    }}>
                        {a.role === "MENTOR" ? "멘토" : "멘티"}
                    </span>
                )
            },
            {
                header: "상태",
                field: "status",
                align: "center",
                render: (a) => {
                    const statusLabelMap: Record<string, string> = {
                        APPLIED: "대기",
                        APPROVED: "승인",
                        REJECTED: "반려",
                        MATCHED: "매칭완료",
                        CANCELED: "취소"
                    };
                    return (
                        <StatusPill
                            status={
                                a.status === "APPROVED" || a.status === "MATCHED" ? "ACTIVE" :
                                    a.status === "REJECTED" ? "INACTIVE" : "PENDING"
                            }
                            label={statusLabelMap[a.status] || a.status}
                        />
                    );
                }
            },
            { header: "신청일", field: "appliedAt", render: (a) => new Date(a.appliedAt).toLocaleDateString() }
        ],
        []
    );

    return (
        <Table<MentoringApplication>
            columns={columns}
            items={items}
            rowKey={(a) => a.applicationId}
            loading={loading}
            skeletonRowCount={5}
            emptyText="신청 내역이 없습니다."
            onRowClick={onRowClick}
        />
    );
}
