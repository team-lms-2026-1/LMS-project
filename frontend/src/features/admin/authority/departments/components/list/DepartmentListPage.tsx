"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDepartmentList } from "../../hooks/useDepartmentList";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button/Button";
import { DepartmentCreateModal } from "../modal/DepartmentCreateModal";
import { DepartmentUpdateModal } from "../modal/DepartmentUpdateModal";
import { DepartmentListItem } from "../../api/types";
import { TableColumn } from "@/components/table/types";
import { toggleDepartmentActive } from "../../api/departmentsApi";
import toast from "react-hot-toast";
import styles from "../../styles/DepartmentList.module.css";
import { ToggleSwitch } from "@/components/toggle/ToggleSwitch";
import { useI18n } from "@/i18n/useI18n";

export default function DepartmentListPage() {
    const t = useI18n("authority.departments.list");
    const router = useRouter();
    const {
        items,
        meta,
        loading,
        page,
        keyword,
        setPage,
        setKeyword, // URL query 업데이트 -> useEffect load() 트리거 -> items 갱신
        reload,
    } = useDepartmentList();

    // 검색어 로컬 상태 (입력 시 URL 바로 변경 방지)
    const [term, setTerm] = useState(keyword);

    // URL keyword 변경 시(뒤로가기 등) 입력창 동기화
    useEffect(() => {
        setTerm(keyword);
    }, [keyword]);

    // 로컬 rows 상태 (Optimistic Update용)
    const [rows, setRows] = useState<DepartmentListItem[]>([]);
    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

    // items 변경 시 rows 동기화
    useEffect(() => {
        setRows(items);
    }, [items]);

    const handleSearch = () => {
        setKeyword(term);
    };

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editDeptId, setEditDeptId] = useState<number | null>(null);

    // 활성/비활성 토글 핸들러 (Optimistic Update)
    const handleToggleActive = async (dept: DepartmentListItem, checked: boolean) => {
        if (pendingIds.has(dept.deptId)) return;

        // 1. Pending 추가
        setPendingIds((prev) => new Set(prev).add(dept.deptId));

        // 2. Optimistic Update
        const previousRows = [...rows];
        setRows((prev) =>
            prev.map((row) =>
                row.deptId === dept.deptId ? { ...row, isActive: checked } : row
            )
        );

        try {
            // 3. API 호출
            await toggleDepartmentActive(dept.deptId, checked);
            toast.success(t("toasts.statusUpdated"));
            // 성공 시 별도 작업 불필요 (이미 반영됨)
            // 단, 서버 데이터와 일치를 보장하려면 reload()를 할 수도 있지만, 
            // AccountListPage 패턴을 따르면 reload 없이 유지합니다.
        } catch (e: any) {
            // 4. 실패 시 롤백
            setRows(previousRows);
            toast.error(e.message || t("toasts.statusUpdateFailed"));
        } finally {
            // 5. Pending 제거
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(dept.deptId);
                return next;
            });
        }
    };

    // 테이블 컬럼 정의
    const columns: TableColumn<DepartmentListItem>[] = [
        { header: t("table.headers.deptCode"), field: "deptCode", width: "12%" },
        { header: t("table.headers.deptName"), field: "deptName", width: "20%" },
        {
            header: t("table.headers.headProfessor"),
            field: "headProfessorName",
            width: "15%",
            render: (row) => row.headProfessorName || t("table.headProfessorFallback"),
        },
        {
            header: t("table.headers.studentCount"),
            field: "studentCount",
            width: "10%",
            render: (row) => t("table.studentCountValue", { count: row.studentCount }),
        },
        {
            header: t("table.headers.professorCount"),
            field: "professorCount",
            width: "10%",
            render: (row) => t("table.professorCountValue", { count: row.professorCount }),
        },
        {
            header: t("table.headers.isActive"),
            field: "isActive",
            width: "10%",
            align: "center",
            render: (row) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch
                        checked={row.isActive}
                        disabled={pendingIds.has(row.deptId)}
                        onChange={(checked) => handleToggleActive(row, checked)}
                    />
                </div>
            ),
        },
        {
            header: t("table.headers.manage"),
            width: "10%",
            align: "center",
            render: (row) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="secondary"
                        onClick={() => setEditDeptId(row.deptId)}
                        className="!h-7 !px-2 !py-0 !text-xs"
                    >
                        {t("table.actions.edit")}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumb}>{t("breadcrumb")}</div>

            <div className={styles.headerRow}>
                <h1 className={styles.title}>{t("title")}</h1>
                <div className="w-64">
                    <SearchBar
                        value={term}
                        onChange={setTerm}
                        placeholder={t("searchPlaceholder")}
                        onSearch={handleSearch}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <Table
                    columns={columns}
                    items={rows}
                    rowKey={(row) => row.deptId}
                    loading={loading}
                    onRowClick={(row) => router.push(`/admin/authority/departments/${row.deptId}`)}
                    emptyText={t("table.emptyText")}
                />

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter}>
                        <PaginationSimple
                            page={page}
                            totalPages={meta.totalPages}
                            onChange={setPage}
                        />
                    </div>
                    <div className={styles.footerRight}>
                        <Button onClick={() => setIsCreateModalOpen(true)}>{t("buttons.create")}</Button>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <DepartmentCreateModal
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        reload();
                    }}
                />
            )}

            {editDeptId && (
                <DepartmentUpdateModal
                    deptId={editDeptId}
                    open={!!editDeptId}
                    onClose={() => setEditDeptId(null)}
                    onSuccess={() => {
                        setEditDeptId(null);
                        reload();
                    }}
                />
            )}
        </div>
    );
}
