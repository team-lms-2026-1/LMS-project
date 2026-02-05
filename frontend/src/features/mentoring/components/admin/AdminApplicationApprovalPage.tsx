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
import { Modal } from "@/components/modal/Modal";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

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
    const [viewApp, setViewApp] = useState<MentoringApplication | null>(null);
    const [confirmApproveId, setConfirmApproveId] = useState<number | null>(null);
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const fetchRecruitments = async () => {
        setLoading(true);
        try {
            const res = await fetchAdminRecruitments({ page: page - 1, size: PAGE_SIZE, keyword: keywordInput });
            if (res && res.content) {
                setRecruitments(res.content);
                setTotalElements(res.totalElements);
            }
        } catch (e: any) {
            console.error(e);
            toast.error("모집 공고 조회 실패: " + (e.message || ""));
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
            toast.error("신청자 조회 실패: " + (e.message || ""));
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

    const handleApprove = (applicationId: number) => {
        setConfirmApproveId(applicationId);
    };

    const confirmApprove = async () => {
        if (!confirmApproveId) return;
        const id = confirmApproveId;
        setConfirmApproveId(null);

        try {
            setProcessingId(id);
            await updateApplicationStatus(id, {
                status: "APPROVED"
            });
            toast.success("승인되었습니다.");
            if (selectedRecruitment) {
                fetchApplications(selectedRecruitment.recruitmentId);
            }
        } catch (e: any) {
            console.error(e);
            toast.error("승인 실패: " + (e.message || ""));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (applicationId: number) => {
        setRejectTargetId(applicationId);
        setRejectReason("");
    };

    const confirmReject = async () => {
        if (!rejectTargetId || !rejectReason.trim()) {
            toast.error("반려 사유를 입력해주세요.");
            return;
        }

        const id = rejectTargetId;
        const reason = rejectReason;
        setRejectTargetId(null);

        try {
            setProcessingId(id);
            await updateApplicationStatus(id, {
                status: "REJECTED",
                rejectReason: reason
            });
            toast.success("반려되었습니다.");
            if (selectedRecruitment) {
                fetchApplications(selectedRecruitment.recruitmentId);
            }
        } catch (e: any) {
            console.error(e);
            toast.error("반려 실패: " + (e.message || ""));
        } finally {
            setProcessingId(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

    const recruitmentColumns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            { header: "학기", field: "semesterId", render: (r) => getSemesterLabel(r.semesterId) },
            { header: "제목", field: "title" },
            {
                header: "모집기간",
                field: "recruitStartAt",
                render: (r) => {
                    const format = (dt: string) => dt ? dt.replace("T", " ").substring(0, 16) : "-";
                    return `${format(r.recruitStartAt)} ~ ${format(r.recruitEndAt)}`;
                }
            },
            {
                header: "상태",
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
                align: "center",
                render: (a) => {
                    const statusLabelMap: Record<string, string> = {
                        APPLIED: "대기",
                        APPROVED: "승인",
                        REJECTED: "반려",
                        MATCHED: "매칭완료",
                        CANCELED: "취소"
                    };
                    return (
                        <StatusPill
                            status={
                                a.status === "APPROVED" || a.status === "MATCHED" ? "ACTIVE" :
                                    a.status === "REJECTED" ? "INACTIVE" : "PENDING"
                            }
                            label={statusLabelMap[a.status] || a.status}
                        />
                    );
                }
            },
            { header: "신청일", field: "appliedAt", render: (a) => new Date(a.appliedAt).toLocaleDateString() },
            {
                header: "작업",
                field: "applicationId",
                stopRowClick: true,
                render: (a) => {
                    if (a.status !== "APPLIED") {
                        return <span className={styles.noAction}>-</span>;
                    }
                    return (
                        <div className={styles.actionButtons}>
                            <Button
                                variant="primary"
                                onClick={() => handleApprove(a.applicationId)}
                                loading={processingId === a.applicationId}
                            >
                                승인
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleReject(a.applicationId)}
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
            <div className={styles.card}>
                <h1 className={styles.title}>멘토링 신청 승인</h1>

                <div className={styles.searchRow}>
                    <SearchBar
                        value={keywordInput}
                        onChange={setKeywordInput}
                        onSearch={fetchRecruitments}
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
                            skeletonRowCount={5}
                            emptyText="모집 공고가 없습니다."
                            onRowClick={(row) => setSelectedRecruitment(row)}
                        />
                    </div>
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
                <div className={styles.section} style={{ marginTop: "40px" }}>
                    <div className={styles.card}>
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
                                    onRowClick={(a) => setViewApp(a)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Modal
                open={!!viewApp}
                title="신청 정보 상세"
                onClose={() => setViewApp(null)}
                footer={<Button onClick={() => setViewApp(null)}>닫기</Button>}
            >
                {viewApp && (
                    <div className={styles.appDetail}>
                        <div className={styles.appInfoGrid}>
                            <div><strong>이름:</strong> {viewApp.name}</div>
                            <div><strong>아이디:</strong> {viewApp.loginId}</div>
                            <div><strong>학과:</strong> {viewApp.deptName || "-"}</div>
                            <div><strong>연락처:</strong> {viewApp.phone || "-"}</div>
                            {viewApp.studentNo && <div><strong>학번:</strong> {viewApp.studentNo}</div>}
                            {viewApp.gradeLevel && <div><strong>학년:</strong> {viewApp.gradeLevel}</div>}
                            <div><strong>이메일:</strong> {viewApp.email || "-"}</div>
                        </div>
                        <div className={styles.divider} />
                        <div><strong>신청 역할:</strong> {viewApp.role === "MENTOR" ? "멘토" : "멘티"}</div>
                        <div><strong>신청일:</strong> {new Date(viewApp.appliedAt).toLocaleString()}</div>
                        <div>
                            <strong>신청 사유:</strong>
                            <div className={styles.appReasonBox}>
                                {viewApp.applyReason || "내용 없음"}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Approval Confirmation */}
            <ConfirmModal
                open={!!confirmApproveId}
                message="이 신청을 승인하시겠습니까?"
                onConfirm={confirmApprove}
                onCancel={() => setConfirmApproveId(null)}
                loading={processingId !== null}
            />

            {/* Rejection Prompt */}
            <Modal
                open={!!rejectTargetId}
                title="반려 사유 입력"
                onClose={() => setRejectTargetId(null)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setRejectTargetId(null)}>취소</Button>
                        <Button variant="danger" onClick={confirmReject} loading={processingId !== null}>반려 처리</Button>
                    </>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                        <label className={styles.formLabel}>반려 사유</label>
                        <textarea
                            className={styles.textarea}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="반려 사유를 입력해주세요."
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
