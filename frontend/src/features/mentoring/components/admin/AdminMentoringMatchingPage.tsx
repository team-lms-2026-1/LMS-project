"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./adminMentoring.module.css";
import { fetchAdminRecruitments, fetchAdminApplications, matchMentoring } from "@/features/mentoring/lib/adminApi";
import { MentoringRecruitment, MentoringApplication } from "@/features/mentoring/types";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Button } from "@/components/button/Button";
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

export default function AdminMentoringMatchingPage() {
    const [page, setPage] = useState(1);
    const [recruitments, setRecruitments] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [selectedRecruitment, setSelectedRecruitment] = useState<MentoringRecruitment | null>(null);
    const [applications, setApplications] = useState<MentoringApplication[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<number | null>(null);
    const [selectedMentee, setSelectedMentee] = useState<number | null>(null);
    const [matching, setMatching] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
            setSelectedMentor(null);
            setSelectedMentee(null);
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

    const handleMatch = () => {
        if (!selectedRecruitment || !selectedMentor || !selectedMentee) {
            toast.error("멘토와 멘티를 모두 선택해주세요.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const confirmMatch = async () => {
        setIsConfirmOpen(false);
        try {
            setMatching(true);
            await matchMentoring({
                recruitmentId: selectedRecruitment!.recruitmentId,
                mentorApplicationId: selectedMentor!,
                menteeApplicationId: selectedMentee!
            });
            toast.success("매칭이 완료되었습니다.");
            fetchApplications(selectedRecruitment!.recruitmentId);
        } catch (e: any) {
            console.error(e);
            // 만약 ApiError라면 e.message가 이미 정제된 메시지임
            toast.error("매칭 실패: " + (e.message || "서버 오류가 발생했습니다."));
        } finally {
            setMatching(false);
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

    const allMentors = applications.filter(app => app.role === "MENTOR" && (app.status === "APPROVED" || app.status === "MATCHED"));
    const availableMentees = applications.filter(app => app.role === "MENTEE" && app.status === "APPROVED");
    const matchedMentees = applications.filter(app => app.role === "MENTEE" && app.status === "MATCHED");

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>멘토링 매칭 관리</h1>

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
                            매칭: {selectedRecruitment.title}
                        </h2>

                        {loadingApplications ? (
                            <div className={styles.loadingText}>신청자 목록을 불러오는 중...</div>
                        ) : (
                            <div className={styles.matchingContainer}>
                                <div className={styles.matchingColumn}>
                                    <h3 className={styles.columnTitle}>멘토 신청 현황</h3>

                                    {/* 수정: 멘토 신청 현황 - 통합된 리스트 */}
                                    <div className={styles.subSection}>
                                        <h4 className={styles.subTitle}>전체 멘토 ({allMentors.length}명)</h4>
                                        <div className={styles.applicationList}>
                                            {allMentors.length === 0 ? (
                                                <div className={styles.emptyText}>신청한 멘토가 없습니다.</div>
                                            ) : (
                                                allMentors.map((mentor) => (
                                                    <div
                                                        key={mentor.applicationId}
                                                        className={`${styles.applicationCard} ${selectedMentor === mentor.applicationId ? styles.selected : ""}`}
                                                        onClick={() => setSelectedMentor(mentor.applicationId)}
                                                    >
                                                        <div className={styles.cardHeader}>
                                                            <span className={styles.cardName}>{mentor.name || mentor.loginId}</span>
                                                            {/* 매칭된 수 표시 */}
                                                            {(mentor.matchedCount || 0) > 0 && (
                                                                <span className={styles.matchedCountBadge}>
                                                                    {mentor.matchedCount}명 매칭
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={styles.cardInfo}>
                                                            <span>학과: {mentor.deptName || "-"}</span>
                                                        </div>
                                                        <div className={styles.cardInfo}>
                                                            <span>신청일: {new Date(mentor.appliedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.matchingColumn}>
                                    <h3 className={styles.columnTitle}>멘티 신청 현황</h3>

                                    <div className={styles.subSection}>
                                        <h4 className={styles.subTitle}>매칭 대기 ({availableMentees.length}명)</h4>
                                        <div className={styles.applicationList}>
                                            {availableMentees.length === 0 ? (
                                                <div className={styles.emptyText}>대기 중인 멘티가 없습니다.</div>
                                            ) : (
                                                availableMentees.map((mentee) => (
                                                    <div
                                                        key={mentee.applicationId}
                                                        className={`${styles.applicationCard} ${selectedMentee === mentee.applicationId ? styles.selected : ""}`}
                                                        onClick={() => setSelectedMentee(mentee.applicationId)}
                                                    >
                                                        <div className={styles.cardHeader}>
                                                            <span className={styles.cardName}>{mentee.name || mentee.loginId}</span>
                                                        </div>
                                                        <div className={styles.cardInfo}>
                                                            <span>신청일: {new Date(mentee.appliedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.subSection}>
                                        <h4 className={styles.subTitle}>매칭 완료 ({matchedMentees.length}명)</h4>
                                        <div className={styles.applicationList}>
                                            {matchedMentees.map((mentee) => (
                                                <div key={mentee.applicationId} className={`${styles.applicationCard} ${styles.matchedCard}`}>
                                                    <div className={styles.cardHeader}>
                                                        <span className={styles.cardName}>{mentee.name || mentee.loginId}</span>
                                                        <span className={styles.matchedBadge}>매칭됨</span>
                                                    </div>
                                                    <div className={styles.cardInfo}>
                                                        <span>학과: {mentee.deptName || "-"}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.matchingActions}>
                            <Button
                                onClick={handleMatch}
                                disabled={!selectedMentor || !selectedMentee}
                                loading={matching}
                                className={styles.matchButton}
                            >
                                매칭하기
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={isConfirmOpen}
                message="선택한 멘토와 멘티를 매칭하시겠습니까?"
                onConfirm={confirmMatch}
                onCancel={() => setIsConfirmOpen(false)}
                loading={matching}
            />
        </div>
    );
}
