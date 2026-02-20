"use client";

import { useRouter } from "next/navigation";
import { useDepartmentProfessors } from "../../hooks/useDepartmentDetail";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar";
import { TableColumn } from "@/components/table/types";
import { DepartmentProfessorListItem, DepartmentDetailSummary } from "../../api/types";
import styles from "../../styles/DepartmentDetail.module.css";
import { Button } from "@/components/button/Button";
import { updateHeadProfessor } from "../../api/departmentsApi";
import toast from "react-hot-toast";

type Props = {
    deptId: number;
    summary?: DepartmentDetailSummary | null;
    reloadSummary?: () => void;
};

export default function DepartmentProfessorsTab({ deptId, summary, reloadSummary }: Props) {
    const router = useRouter();
    const { items, meta, page, keyword, loading, setPage, setKeyword, reload } = useDepartmentProfessors(deptId);

    const handleAssignHeadProfessor = async (prof: DepartmentProfessorListItem) => {
        if (!confirm(`'${prof.name}' 교수를 학과장으로 지정하시겠습니까?`)) return;

        try {
            await updateHeadProfessor(deptId, prof.accountId);
            toast.success("학과장이 지정되었습니다.");
            if (reloadSummary) reloadSummary(); // 상단 정보 갱신
            reload(); // 목록 갱신 (필요하다면)
        } catch (e: any) {
            toast.error(e.message || "학과장 지정 실패");
        }
    };

    const columns: TableColumn<DepartmentProfessorListItem>[] = [
        { header: "교번", field: "professorNo", width: "15%" },
        { header: "이름", field: "name", width: "20%" },
        { header: "이메일", field: "email", width: "25%" },
        { header: "전화번호", field: "phone", width: "20%" },
        {
            header: "관리",
            width: "20%",
            align: "center",
            render: (row) => {
                const isHead = summary?.chairProfessor?.accountId === row.accountId;
                if (isHead) {
                    return (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            학과장
                        </span>
                    );
                }
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="secondary"
                            onClick={() => handleAssignHeadProfessor(row)}
                            className="px-2 py-1 text-xs h-8"
                        >
                            학과장 지정
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
                    <SearchBar value={keyword} onChange={setKeyword} onSearch={() => setPage(1)} placeholder="이름 / 교번 검색" />
                </div>
                <div className={styles.statsContainer}>
                    <span className={styles.statItemProfessor}>교수명수: {meta.totalElements}명</span>
                </div>
            </div>

            <div className="bg-white rounded shadow">
                <Table
                    columns={columns}
                    items={items}
                    rowKey={(row) => row.accountId}
                    loading={loading}
                    emptyText="소속 교수가 없습니다."
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
