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

const PAGE_SIZE = 10;

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
            setSelectedMentor(null);
            setSelectedMentee(null);
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

    const handleMatch = async () => {
        if (!selectedRecruitment || !selectedMentor || !selectedMentee) {
            alert("멘토와 멘티를 모두 선택해주세요.");
            return;
        }

        if (!confirm("선택한 멘토와 멘티를 매칭하시겠습니까?")) return;

        try {
            setMatching(true);
            await matchMentoring({
                recruitmentId: selectedRecruitment.recruitmentId,
                mentorApplicationId: selectedMentor,
                menteeApplicationId: selectedMentee
            });
            alert("매칭이 완료되었습니다.");
            fetchApplications(selectedRecruitment.recruitmentId);
        } catch (e: any) {
            console.error(e);
            alert("매칭 실패: " + (e.message || ""));
        } finally {
            setMatching(false);
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

    const mentors = applications.filter(app => app.role === "MENTOR" && app.status === "APPROVED");
    const mentees = applications.filter(app => app.role === "MENTEE" && app.status === "APPROVED");

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>멘토링 매칭 관리</h1>
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
                        매칭: {selectedRecruitment.title}
                    </h2>

                    {loadingApplications ? (
                        <div className={styles.loadingText}>신청자 목록을 불러오는 중...</div>
                    ) : (
                        <div className={styles.matchingContainer}>
                            <div className={styles.matchingColumn}>
                                <h3 className={styles.columnTitle}>승인된 멘토 ({mentors.length}명)</h3>
                                <div className={styles.applicationList}>
                                    {mentors.length === 0 ? (
                                        <div className={styles.emptyText}>승인된 멘토가 없습니다.</div>
                                    ) : (
                                        mentors.map((mentor) => (
                                            <div
                                                key={mentor.applicationId}
                                                className={`${styles.applicationCard} ${selectedMentor === mentor.applicationId ? styles.selected : ""}`}
                                                onClick={() => setSelectedMentor(mentor.applicationId)}
                                            >
                                                <div className={styles.cardHeader}>
                                                    <span className={styles.cardName}>{mentor.name || mentor.loginId}</span>
                                                    {mentor.status === "MATCHED" && (
                                                        <span className={styles.matchedBadge}>매칭됨</span>
                                                    )}
                                                </div>
                                                <div className={styles.cardInfo}>
                                                    <span>신청일: {new Date(mentor.appliedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className={styles.matchingColumn}>
                                <h3 className={styles.columnTitle}>승인된 멘티 ({mentees.length}명)</h3>
                                <div className={styles.applicationList}>
                                    {mentees.length === 0 ? (
                                        <div className={styles.emptyText}>승인된 멘티가 없습니다.</div>
                                    ) : (
                                        mentees.map((mentee) => (
                                            <div
                                                key={mentee.applicationId}
                                                className={`${styles.applicationCard} ${selectedMentee === mentee.applicationId ? styles.selected : ""}`}
                                                onClick={() => setSelectedMentee(mentee.applicationId)}
                                            >
                                                <div className={styles.cardHeader}>
                                                    <span className={styles.cardName}>{mentee.name || mentee.loginId}</span>
                                                    {mentee.status === "MATCHED" && (
                                                        <span className={styles.matchedBadge}>매칭됨</span>
                                                    )}
                                                </div>
                                                <div className={styles.cardInfo}>
                                                    <span>신청일: {new Date(mentee.appliedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
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
            )}
        </div>
    );
}
