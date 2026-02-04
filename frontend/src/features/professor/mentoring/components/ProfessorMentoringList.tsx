"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./ProfessorMentoring.module.css";
import { fetchProfessorRecruitments } from "@/features/mentoring/lib/professorApi";
import { MentoringRecruitment } from "@/features/mentoring/types";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { MentorApplyModal } from "./MentorApplyModal";

const PAGE_SIZE = 10;

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
            const res = await fetchProfessorRecruitments({ page: page - 1, size: PAGE_SIZE });
            if (res && res.content) {
                setItems(res.content);
                setTotalElements(res.totalElements);
            } else {
                console.warn("No content in response", res);
            }
        } catch (e: any) {
            console.error(e);
            alert("데이터 로드 실패: " + (e.message || JSON.stringify(e)));
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
            { header: "학기", field: "semesterId", render: (r) => `${r.semesterId}학기` },
            { header: "제목", field: "title" },
            { header: "모집기간", field: "recruitStartAt", render: (r) => `${r.recruitStartAt.split("T")[0]} ~ ${r.recruitEndAt.split("T")[0]}` },
            {
                header: "상태",
                field: "status",
                render: (r) => <StatusPill status={r.status === "OPEN" ? "ACTIVE" : "INACTIVE"} label={r.status} />
            },
            { header: "생성일시", field: "recruitStartAt", render: (r) => r.recruitStartAt.split("T")[0] }
        ],
        []
    );

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div className={styles.title}>멘토 신청</div>
                <SearchBar
                    value={keywordInput}
                    onChange={setKeywordInput}
                    onSearch={() => { }}
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
                    emptyText="모집 공고가 없습니다."
                    onRowClick={(row) => setSelectedRecruitment(row)}
                />
            </div>

            <div className={styles.paginationContainer}>
                <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
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


