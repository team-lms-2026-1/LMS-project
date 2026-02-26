import { useMemo } from "react";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import { MentoringRecruitment } from "../api/types";
import styles from "./MentoringRecruitmentsTable.module.css";
import { SelectOption } from "@/features/dropdowns/semesters/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    items: MentoringRecruitment[];
    loading: boolean;
    onEdit: (row: MentoringRecruitment) => void;
    onDelete: (id: number) => void;
    semesterOptions: SelectOption[];
};

export function MentoringRecruitmentsTable({ items, loading, onEdit, onDelete, semesterOptions }: Props) {
    const tTable = useI18n("mentoring.recruitments.table");
    const tCommon = useI18n("mentoring.recruitments.common");

    const getSemesterLabel = (id: number) => {
        return semesterOptions.find(opt => opt.value === String(id))?.label || tCommon("semesterFallback", { id });
    };

    const statusLabel = (status: "DRAFT" | "OPEN" | "CLOSED") => {
        if (status === "DRAFT") return tCommon("statusLabel.DRAFT");
        if (status === "OPEN") return tCommon("statusLabel.OPEN");
        return tCommon("statusLabel.CLOSED");
    };

    const columns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            { header: tTable("headers.semester"), field: "semesterId", render: (row) => row.semesterName || getSemesterLabel(row.semesterId) },
            { header: tTable("headers.title"), field: "title" },
            {
                header: tTable("headers.period"),
                field: "recruitStartAt",
                render: (row) => {
                    const format = (dt: string) => dt ? dt.replace("T", " ").substring(0, 16) : "-";
                    return `${format(row.recruitStartAt)} ~ ${format(row.recruitEndAt)}`;
                }
            },
            {
                header: tTable("headers.status"),
                field: "status",
                align: "center",
                render: (row) => {
                    if (row.status === "DRAFT") return <StatusPill status="DRAFT" label={statusLabel("DRAFT")} />;
                    if (row.status === "CLOSED") return <StatusPill status="INACTIVE" label={statusLabel("CLOSED")} />;

                    const now = new Date();
                    const start = new Date(row.recruitStartAt);
                    const end = new Date(row.recruitEndAt);

                    if (now < start) {
                        return <StatusPill status="DRAFT" label={statusLabel("DRAFT")} />;
                    } else if (now >= start && now <= end) {
                        return <StatusPill status="ACTIVE" label={statusLabel("OPEN")} />;
                    } else {
                        return <StatusPill status="INACTIVE" label={statusLabel("CLOSED")} />;
                    }
                }
            },
            {
                header: tTable("headers.manage"),
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
                            {tTable("buttons.edit")}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => onDelete(row.recruitmentId)}
                        >
                            {tTable("buttons.delete")}
                        </Button>
                    </div>
                )
            }
        ],
        [onEdit, onDelete, semesterOptions, tCommon, tTable]
    );


    return (
        <Table<MentoringRecruitment>
            columns={columns}
            items={items}
            rowKey={(r) => r.recruitmentId}
            loading={loading}
            skeletonRowCount={10}
            emptyText={tTable("emptyText")}
        />
    );
}
