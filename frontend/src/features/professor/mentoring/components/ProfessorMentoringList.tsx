"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./ProfessorMentoring.module.css";
import { fetchRecruitments } from "@/features/mentoring/api/mentoringApi";
import { MentoringRecruitment } from "@/features/mentoring/api/types";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { MentorApplyModal } from "./MentorApplyModal";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

const SEMESTER_OPTIONS = [
    { label: "1학기", value: 1 },
    { label: "여름학기", value: 2 },
    { label: "2학기", value: 3 },
    { label: "겨울학기", value: 4 },
];

const getSemesterLabel = (id: number) => {
    return SEMESTER_OPTIONS.find(opt => opt.value === id)?.label || `${id}학기`;
};

export default function ProfessorMentoringList() {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [selectedRecruitment, setSelectedRecruitment] = useState<MentoringRecruitment | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetchRecruitments({ page: page - 1, size: PAGE_SIZE, keyword: keywordInput, status: "OPEN" });
            if (res && res.data) {
                setItems(res.data);
                setTotalElements(res.meta?.totalElements || 0);
            } else {
                console.warn("No content in response", res);
            }
        } catch (e: any) {
            console.error(e);
            toast.error("데이터 로드 실패: " + (e.message || JSON.stringify(e)));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

    const columns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            { header: "학기", field: "semesterId", render: (r) => getSemesterLabel(r.semesterId) },
            { header: "제목", field: "title" },
            { header: "모집기간", field: "recruitStartAt", render: (r) => `${r.recruitStartAt.split("T")[0]} ~ ${r.recruitEndAt.split("T")[0]}` },
            {
                header: "모집상태",
                field: "status",
                render: (r) => {
                    const now = new Date();
                    const start = new Date(r.recruitStartAt);
                    const end = new Date(r.recruitEndAt);

                    if (now < start) {
                        return <StatusPill status="PENDING" label="대기" />;
                    } else if (now >= start && now <= end) {
                        return <StatusPill status="ACTIVE" label="OPEN" />;
                    } else {
                        return <StatusPill status="INACTIVE" label="CLOSED" />;
                    }
                }
            },
            {
                header: "나의 신청 정보",
                field: "applyStatus",
                align: "center",
                render: (r) => (
                    r.applyStatus ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>({r.appliedRole === "MENTOR" ? "멘토" : "멘티"})</span>
                            <StatusPill
                                status={
                                    r.applyStatus === "APPROVED" || r.applyStatus === "MATCHED" ? "ACTIVE" :
                                        r.applyStatus === "REJECTED" ? "INACTIVE" : "PENDING"
                                }
                                label={
                                    r.applyStatus === "APPLIED" ? "신청완료" :
                                        r.applyStatus === "APPROVED" ? "승인됨" :
                                            r.applyStatus === "REJECTED" ? "반려됨" :
                                                r.applyStatus === "MATCHED" ? "매칭완료" :
                                                    r.applyStatus === "CANCELED" ? "취소됨" : r.applyStatus
                                }
                            />
                        </div>
                    ) : <span style={{ color: '#ccc' }}>미신청</span>
                )
            },
            { header: "생성일시", field: "recruitStartAt", render: (r) => r.recruitStartAt.split("T")[0] }
        ],
        []
    );

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>멘토 신청</h1>

                <div className={styles.searchRow}>
                    <SearchBar
                        value={keywordInput}
                        onChange={setKeywordInput}
                        onSearch={fetchData}
                        placeholder="제목을 입력하세요"
                        className={styles.searchBox}
                    />
                </div>

                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        items={items}
                        rowKey={(r) => r.recruitmentId}
                        loading={loading}
                        skeletonRowCount={PAGE_SIZE}
                        emptyText="모집 공고가 없습니다."
                        onRowClick={(row) => {
                            if (row.applyStatus) {
                                toast.error("이미 신청한 공고입니다.");
                                return;
                            }
                            const now = new Date();
                            const start = new Date(row.recruitStartAt);
                            const end = new Date(row.recruitEndAt);

                            if (now < start || now > end) {
                                toast.error("신청 기간이 아닙니다.");
                                return;
                            }
                            setSelectedRecruitment(row);
                        }}
                    />
                </div>

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter}>
                        <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
                    </div>
                    <div className={styles.footerRight} />
                </div>
            </div>

            {selectedRecruitment && (
                <MentorApplyModal
                    recruitment={selectedRecruitment}
                    onClose={() => setSelectedRecruitment(null)}
                    onSuccess={() => {
                        setSelectedRecruitment(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}


