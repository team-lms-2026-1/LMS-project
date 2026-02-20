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

type Props = {
    deptId: number;
};

export default function DepartmentMajorsTab({ deptId }: Props) {
    const { majors, meta, page, keyword, loading, setPage, setKeyword, reload } = useDepartmentMajors(deptId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editMajorId, setEditMajorId] = useState<number | null>(null);
    const [deleteMajorId, setDeleteMajorId] = useState<number | null>(null);

    const handleDeleteClick = (majorId: number) => {
        setDeleteMajorId(majorId);
    };

    const confirmDelete = async () => {
        if (!deleteMajorId) return;
        try {
            await deleteMajor(deptId, deleteMajorId);
            toast.success("전공이 삭제되었습니다.");
            reload();
        } catch (e: any) {
            toast.error(e.message || "전공 삭제 실패");
        } finally {
            setDeleteMajorId(null);
        }
    };

    const columns: TableColumn<MajorListItem>[] = [
        { header: "전공코드", field: "majorCode", width: "15%" },
        { header: "전공명", field: "majorName", width: "25%" },
        { header: "재학생 수", field: "enrolledStudentCount", width: "15%", render: (row) => `${row.enrolledStudentCount}명` },
        {
            header: "상태",
            width: "10%",
            align: "center",
            render: (row) => (
                <StatusPill
                    status={row.isActive ? "ACTIVE" : "INACTIVE"}
                    label={row.isActive ? "활성" : "비활성"}
                />
            )
        },
        {
            header: "관리",
            width: "15%",
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => setEditMajorId(row.majorId)}
                    >
                        수정
                    </Button>
                    <Button
                        variant="danger"
                        className="px-2 py-1 text-xs"
                        onClick={() => handleDeleteClick(row.majorId)}
                    >
                        삭제
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="mt-4">
            <div className={`${styles.filterRow} justify-end`}>
                <div className="w-64">
                    <SearchBar value={keyword} onChange={setKeyword} onSearch={() => setPage(1)} placeholder="전공코드 / 전공명 검색" />
                </div>
            </div>

            <div className="bg-white rounded shadow">
                <Table
                    columns={columns}
                    items={majors}
                    rowKey={(row) => row.majorId}
                    loading={loading}
                    emptyText="등록된 전공이 없습니다."
                />

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter}>
                        <PaginationSimple page={page} totalPages={meta.totalPages} onChange={setPage} />
                    </div>
                    <div className={styles.footerRight}>
                        <Button onClick={() => setIsCreateModalOpen(true)}>전공 추가</Button>
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

            {editMajorId !== null && (
                <MajorUpdateModal
                    deptId={deptId}
                    majorId={editMajorId}
                    open={editMajorId !== null}
                    onClose={() => setEditMajorId(null)}
                    onSuccess={() => { setEditMajorId(null); reload(); }}
                />
            )}

            <ConfirmModal
                open={deleteMajorId !== null}
                title="전공 삭제"
                message="정말 이 전공을 삭제하시겠습니까? 삭제된 전공은 복구할 수 없습니다."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteMajorId(null)}
                type="danger"
            />
        </div>
    );
}
