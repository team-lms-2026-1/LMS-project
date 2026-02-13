"use client";

import { useRouter } from "next/navigation";
import { useDepartmentStudents } from "../../hooks/useDepartmentDetail";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar";
import { TableColumn } from "@/components/table/types";
import { DepartmentStudentListItem, DepartmentDetailSummary } from "../../api/types";
import styles from "../../styles/DepartmentDetail.module.css";


type Props = {
    deptId: number;
    summary?: DepartmentDetailSummary | null;
};

export default function DepartmentStudentsTab({ deptId, summary }: Props) {
    const router = useRouter();
    const { items, meta, page, keyword, loading, setPage, setKeyword } = useDepartmentStudents(deptId);

    const columns: TableColumn<DepartmentStudentListItem>[] = [
        { header: "학번", field: "studentNo", width: "15%" },
        { header: "이름", field: "name", width: "15%" },
        { header: "학년", field: "gradeLevel", width: "10%", render: (row) => `${row.gradeLevel}학년` },
        {
            header: "재적상태",
            field: "academicStatus",
            width: "15%",
            render: (row) => {
                switch (row.academicStatus) {
                    case "ENROLLED": return "재학중";
                    case "LEAVE": return "휴학중";
                    case "GRADUATED": return "졸업";
                    case "DROPPED": return "제적";
                    default: return row.academicStatus;
                }
            }
        },
        { header: "전공", field: "majorName", width: "20%", render: (row) => row.majorName || "-" },
        { header: "이메일", field: "email", width: "25%" },
    ];

    return (
        <div className="mt-4">
            <div className={styles.filterRow}>
                <div className="w-64">
                    <SearchBar value={keyword} onChange={setKeyword} onSearch={() => setPage(1)} placeholder="이름 / 학번 검색" />
                </div>

                <div className={styles.statsContainer}>
                    <span className={styles.statItemEnrolled}>재학생: {summary?.studentCount?.enrolled || 0}명</span>
                    <span className={styles.statItemLeave}>휴학생: {summary?.studentCount?.leaveOfAbsence || 0}명</span>
                    <span className={styles.statItemGraduated}>졸업생: {summary?.studentCount?.graduated || 0}명</span>
                </div>
            </div>

            <div className="bg-white rounded shadow">
                <Table
                    columns={columns}
                    items={items}
                    rowKey={(row) => row.accountId}
                    loading={loading}
                    emptyText="소속 학생이 없습니다."
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
