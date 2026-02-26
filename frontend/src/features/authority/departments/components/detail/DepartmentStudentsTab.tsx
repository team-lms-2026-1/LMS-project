"use client";

import { useDepartmentStudents } from "../../hooks/useDepartmentDetail";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar";
import { TableColumn } from "@/components/table/types";
import { DepartmentStudentListItem, DepartmentDetailSummary } from "../../api/types";
import styles from "../../styles/DepartmentDetail.module.css";
import { useI18n } from "@/i18n/useI18n";


type Props = {
    deptId: number;
    summary?: DepartmentDetailSummary | null;
};

export default function DepartmentStudentsTab({ deptId, summary }: Props) {
    const t = useI18n("authority.departments.detail.studentsTab");
    const { items, meta, page, keyword, loading, setPage, setKeyword } = useDepartmentStudents(deptId);

    const columns: TableColumn<DepartmentStudentListItem>[] = [
        { header: t("table.headers.studentNo"), field: "studentNo", width: "15%" },
        { header: t("table.headers.name"), field: "name", width: "15%" },
        {
            header: t("table.headers.gradeLevel"),
            field: "gradeLevel",
            width: "10%",
            render: (row) => t("table.gradeValue", { grade: row.gradeLevel }),
        },
        {
            header: t("table.headers.academicStatus"),
            field: "academicStatus",
            width: "15%",
            render: (row) => {
                switch (row.academicStatus) {
                    case "ENROLLED": return t("academicStatus.ENROLLED");
                    case "LEAVE": return t("academicStatus.LEAVE");
                    case "GRADUATED": return t("academicStatus.GRADUATED");
                    case "DROPPED": return t("academicStatus.DROPPED");
                    default: return row.academicStatus;
                }
            }
        },
        {
            header: t("table.headers.majorName"),
            field: "majorName",
            width: "20%",
            render: (row) => row.majorName || t("table.majorFallback"),
        },
        { header: t("table.headers.email"), field: "email", width: "25%" },
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
                    <span className={styles.statItemEnrolled}>
                        {t("stats.enrolled", { count: summary?.studentCount?.enrolled || 0 })}
                    </span>
                    <span className={styles.statItemLeave}>
                        {t("stats.leaveOfAbsence", { count: summary?.studentCount?.leaveOfAbsence || 0 })}
                    </span>
                    <span className={styles.statItemGraduated}>
                        {t("stats.graduated", { count: summary?.studentCount?.graduated || 0 })}
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
        </div>
    );
}
