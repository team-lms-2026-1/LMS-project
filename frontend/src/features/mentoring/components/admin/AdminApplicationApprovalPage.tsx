"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./adminMentoring.module.css";
import { fetchAdminRecruitments, fetchAdminApplications, updateApplicationStatus } from "@/features/mentoring/lib/adminApi";
import { MentoringRecruitment, MentoringApplication } from "@/features/mentoring/types";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Button } from "@/components/button/Button";

const PAGE_SIZE = 10;

export default function AdminApplicationApprovalPage() {
    const [page, setPage] = useState(1);
    const [recruitments, setRecruitments] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [selectedRecruitment, setSelectedRecruitment] = useState<MentoringRecruitment | null>(null);
    const [applications, setApplications] = useState<MentoringApplication[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchRecruitments = async () => {
        setLoading(true);
        try {
            const res = await fetchAdminRecruitments({ page: page - 1, size: PAGE_SIZE });
            if (res && res.content) {
                setRecruitments(res.content);
                setTotalElements(res.totalElements);
            }
        } catch (e: any) {
            console.error(e);
            alert("모집 공고 조회 실패: " + (e.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async (recruitmentId: number) => {
        setLoadingApplications(true);
        try {
            const data = await fetchAdminApplications(recruitmentId);
            setApplications(data || []);
        } catch (e: any) {
            console.error(e);
            alert("신청자 조회 실패: " + (e.message || ""));
        } finally {
            setLoadingApplications(false);
        }
    };

    useEffect(() => {
        fetchRecruitments();
    }, [page]);

    useEffect(() => {
        if (selectedRecruitment) {
            fetchApplications(selectedRecruitment.recruitmentId);
        }
    }, [selectedRecruitment]);

    const handleApprove = async (applicationId: number) => {
        if (!confirm("이 신청을 승인하시겠습니까?")) return;

        try {
            setProcessingId(applicationId);
            await updateApplicationStatus(applicationId, {
                status: "APPROVED"
            });
            alert("승인되었습니다.");
            if (selectedRecruitment) {
                fetchApplications(selectedRecruitment.recruitmentId);
            }
        } catch (e: any) {
            console.error(e);
            alert("승인 실패: " + (e.message || ""));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (applicationId: number) => {
        const reason = prompt("반려 사유를 입력해주세요:");
        if (!reason) return;

        try {
            setProcessingId(applicationId);
            await updateApplicationStatus(applicationId, {
                status: "REJECTED",
                rejectReason: reason
            });
            alert("반려되었습니다.");
            if (selectedRecruitment) {
                fetchApplications(selectedRecruitment.recruitmentId);
            }
        } catch (e: any) {
            console.error(e);
            alert("반려 실패: " + (e.message || ""));
        } finally {
            setProcessingId(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

    const recruitmentColumns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            { header: "학기", field: "semesterId", render: (r) => `${r.semesterId}학기` },
            { header: "제목", field: "title" },
            { header: "모집기간", field: "recruitStartAt", render: (r) => `${r.recruitStartAt.split("T")[0]} ~ ${r.recruitEndAt.split("T")[0]}` },
            {
                header: "상태",
                field: "status",
                render: (r) => <StatusPill status={r.status === "OPEN" ? "ACTIVE" : "INACTIVE"} label={r.status} />
            },
        ],
        []
    );

    const applicationColumns = useMemo<TableColumn<MentoringApplication>[]>(
        () => [
            { header: "이름", field: "name", render: (a) => a.name || a.loginId },
            {
                header: "역할",
                field: "role",
                render: (a) => (
                    <span className={a.role === "MENTOR" ? styles.mentorBadge : styles.menteeBadge}>
                        {a.role === "MENTOR" ? "멘토" : "멘티"}
                    </span>
                )
            },
            {
                header: "상태",
                field: "status",
                render: (a) => {
                    const statusMap: Record<string, { status: "ACTIVE" | "INACTIVE"; label: string }> = {
                        APPLIED: { status: "INACTIVE", label: "대기" },
                        APPROVED: { status: "ACTIVE", label: "승인" },
                        REJECTED: { status: "INACTIVE", label: "반려" },
                        MATCHED: { status: "ACTIVE", label: "매칭완료" },
                        CANCELED: { status: "INACTIVE", label: "취소" }
                    };
                    const info = statusMap[a.status] || { status: "INACTIVE" as const, label: a.status };
                    return <StatusPill status={info.status} label={info.label} />;
                }
            },
            { header: "신청일", field: "appliedAt", render: (a) => new Date(a.appliedAt).toLocaleDateString() },
            {
                header: "작업",
                field: "applicationId",
                render: (a) => {
                    if (a.status !== "APPLIED") {
                        return <span className={styles.noAction}>-</span>;
                    }
                    return (
                        <div className={styles.actionButtons}>
                            <Button
                                variant="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(a.applicationId);
                                }}
                                loading={processingId === a.applicationId}
                            >
                                승인
                            </Button>
                            <Button
                                variant="danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(a.applicationId);
                                }}
                                loading={processingId === a.applicationId}
                            >
                                반려
                            </Button>
                        </div>
                    );
                }
            }
        ],
        [processingId]
    );

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>멘토링 신청 승인</h1>
                <SearchBar
                    value={keywordInput}
                    onChange={setKeywordInput}
                    onSearch={() => { }}
                    placeholder="모집 공고 제목 검색"
                    className={styles.searchBox}
                />
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>모집 공고 목록</h2>
                <div className={styles.tableWrap}>
                    <Table
                        columns={recruitmentColumns}
                        items={recruitments}
                        rowKey={(r) => r.recruitmentId}
                        loading={loading}
                        emptyText="모집 공고가 없습니다."
                        onRowClick={(row) => setSelectedRecruitment(row)}
                    />
                </div>
                <div className={styles.paginationContainer}>
                    <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
                </div>
            </div>

            {selectedRecruitment && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        신청자 목록: {selectedRecruitment.title}
                    </h2>

                    {loadingApplications ? (
                        <div className={styles.loadingText}>신청자 목록을 불러오는 중...</div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <Table
                                columns={applicationColumns}
                                items={applications}
                                rowKey={(a) => a.applicationId}
                                loading={false}
                                emptyText="신청자가 없습니다."
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
