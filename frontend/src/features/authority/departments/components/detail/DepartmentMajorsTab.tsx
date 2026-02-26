"use client";

import { useState } from "react";
import { useDepartmentMajors } from "../../hooks/useDepartmentDetail";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button/Button";
import { TableColumn } from "@/components/table/types";
import { MajorListItem } from "../../api/types";
import { MajorCreateModal } from "../modal/MajorCreateModal";
import { MajorUpdateModal } from "../modal/MajorUpdateModal";
import { deleteMajor } from "../../api/departmentsApi";
import styles from "../../styles/DepartmentDetail.module.css";
import toast from "react-hot-toast";
import { StatusPill } from "@/components/status/StatusPill";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    deptId: number;
};

export default function DepartmentMajorsTab({ deptId }: Props) {
    const t = useI18n("authority.departments.detail.majorsTab");
    const { majors, meta, page, keyword, loading, setPage, setKeyword, reload } = useDepartmentMajors(deptId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editMajor, setEditMajor] = useState<MajorListItem | null>(null);
    const [deleteMajorId, setDeleteMajorId] = useState<number | null>(null);

    const handleDeleteClick = (majorId: number) => {
        setDeleteMajorId(majorId);
    };

    const confirmDelete = async () => {
        if (!deleteMajorId) return;
        try {
            await deleteMajor(deptId, deleteMajorId);
            toast.success(t("toasts.deleteSuccess"));
            reload();
        } catch (e: any) {
            toast.error(e.message || t("toasts.deleteFailed"));
        } finally {
            setDeleteMajorId(null);
        }
    };

    const columns: TableColumn<MajorListItem>[] = [
        { header: t("table.headers.majorCode"), field: "majorCode", width: "15%" },
        { header: t("table.headers.majorName"), field: "majorName", width: "25%" },
        {
            header: t("table.headers.enrolledStudentCount"),
            field: "enrolledStudentCount",
            width: "15%",
            render: (row) => t("table.enrolledStudentCountValue", { count: row.enrolledStudentCount }),
        },
        {
            header: t("table.headers.status"),
            width: "10%",
            align: "center",
            render: (row) => (
                <StatusPill
                    status={row.isActive ? "ACTIVE" : "INACTIVE"}
                    label={row.isActive ? t("table.status.active") : t("table.status.inactive")}
                />
            )
        },
        {
            header: t("table.headers.manage"),
            width: "15%",
            align: "center",
            render: (row) => (
                <div className={styles.actionButtons}>
                    <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => setEditMajor(row)}
                    >
                        {t("table.actions.edit")}
                    </Button>
                    <Button
                        variant="danger"
                        className="px-2 py-1 text-xs"
                        onClick={() => handleDeleteClick(row.majorId)}
                    >
                        {t("table.actions.delete")}
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="mt-4">
            <div className={`${styles.filterRow} justify-end`}>
                <div className="w-64">
                    <SearchBar
                        value={keyword}
                        onChange={setKeyword}
                        onSearch={() => setPage(1)}
                        placeholder={t("searchPlaceholder")}
                    />
                </div>
            </div>

            <div className="bg-white rounded shadow">
                <Table
                    columns={columns}
                    items={majors}
                    rowKey={(row) => row.majorId}
                    loading={loading}
                    emptyText={t("table.emptyText")}
                />

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter}>
                        <PaginationSimple page={page} totalPages={meta.totalPages} onChange={setPage} />
                    </div>
                    <div className={styles.footerRight}>
                        <Button onClick={() => setIsCreateModalOpen(true)}>{t("buttons.create")}</Button>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <MajorCreateModal
                    deptId={deptId}
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => { setIsCreateModalOpen(false); reload(); }}
                />
            )}

            {editMajor !== null && (
                <MajorUpdateModal
                    deptId={deptId}
                    majorId={editMajor.majorId}
                    enrolledStudentCount={editMajor.enrolledStudentCount}
                    isActive={editMajor.isActive}
                    open={editMajor !== null}
                    onClose={() => setEditMajor(null)}
                    onSuccess={() => { setEditMajor(null); reload(); }}
                />
            )}

            <ConfirmModal
                open={deleteMajorId !== null}
                title={t("confirm.title")}
                message={t("confirm.message")}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteMajorId(null)}
                type="danger"
            />
        </div>
    );
}
