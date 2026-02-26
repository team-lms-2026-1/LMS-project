"use client";

import { useState } from "react";
import { useDepartmentProfessors } from "../../hooks/useDepartmentDetail";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar";
import { TableColumn } from "@/components/table/types";
import { DepartmentProfessorListItem, DepartmentDetailSummary } from "../../api/types";
import styles from "../../styles/DepartmentDetail.module.css";
import { Button } from "@/components/button/Button";
import { ConfirmModal } from "@/components/modal";
import { updateHeadProfessor } from "../../api/departmentsApi";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    deptId: number;
    summary?: DepartmentDetailSummary | null;
    reloadSummary?: () => void;
};

export default function DepartmentProfessorsTab({ deptId, summary, reloadSummary }: Props) {
    const t = useI18n("authority.departments.detail.professorsTab");
    const { items, meta, page, keyword, loading, setPage, setKeyword, reload } = useDepartmentProfessors(deptId);

    const [confirmTarget, setConfirmTarget] = useState<DepartmentProfessorListItem | null>(null);
    const [assigning, setAssigning] = useState(false);

    const handleAssignConfirm = async () => {
        if (!confirmTarget) return;
        try {
            setAssigning(true);
            await updateHeadProfessor(deptId, confirmTarget.accountId);
            toast.success(t("toasts.assignSuccess"));
            if (reloadSummary) reloadSummary();
            reload();
        } catch (e: any) {
            toast.error(e.message || t("toasts.assignFailed"));
        } finally {
            setAssigning(false);
            setConfirmTarget(null);
        }
    };

    const columns: TableColumn<DepartmentProfessorListItem>[] = [
        { header: t("table.headers.professorNo"), field: "professorNo", width: "15%" },
        { header: t("table.headers.name"), field: "name", width: "20%" },
        { header: t("table.headers.email"), field: "email", width: "25%" },
        { header: t("table.headers.phone"), field: "phone", width: "20%" },
        {
            header: t("table.headers.manage"),
            width: "20%",
            align: "center",
            render: (row) => {
                const isHead = summary?.chairProfessor?.accountId === row.accountId;
                if (isHead) {
                    return (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {t("table.headProfessorBadge")}
                        </span>
                    );
                }
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmTarget(row)}
                            className="px-2 py-1 text-xs h-8"
                        >
                            {t("table.assignHeadProfessor")}
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="mt-4">
            <div className={styles.filterRow}>
                <div className="w-64">
                    <SearchBar
                        value={keyword}
                        onChange={setKeyword}
                        onSearch={() => setPage(1)}
                        placeholder={t("searchPlaceholder")}
                    />
                </div>
                <div className={styles.statsContainer}>
                    <span className={styles.statItemProfessor}>
                        {t("stats.professorCount", { count: meta.totalElements })}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded shadow">
                <Table
                    columns={columns}
                    items={items}
                    rowKey={(row) => row.accountId}
                    loading={loading}
                    emptyText={t("table.emptyText")}
                />

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter}>
                        <PaginationSimple page={page} totalPages={meta.totalPages} onChange={setPage} />
                    </div>
                    <div className={styles.footerRight} />
                </div>
            </div>

            <ConfirmModal
                open={confirmTarget !== null}
                title={t("confirm.title")}
                message={confirmTarget ? t("confirm.message", { name: confirmTarget.name }) : ""}
                onConfirm={handleAssignConfirm}
                onCancel={() => setConfirmTarget(null)}
                loading={assigning}
                type="primary"
            />
        </div>
    );
}
