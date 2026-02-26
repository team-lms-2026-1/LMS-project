"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./adminMentoring.module.css";
import { fetchAdminRecruitments, fetchAdminApplications, fetchAdminMatchings, matchMentoring } from "../../api/mentoringApi";
import { MentoringRecruitment, MentoringApplication } from "../../api/types";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Button } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { Dropdown } from "@/features/dropdowns/_shared";

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

    // Matching State
    const [selectedMentor, setSelectedMentor] = useState<number | null>(null);
    const [selectedMentees, setSelectedMentees] = useState<number[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [matching, setMatching] = useState(false);
    const [matchingsList, setMatchingsList] = useState<any[]>([]);

    const { options: semesterOptions, loading: semesterLoading } = useSemestersDropdownOptions();

    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchRecruitList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAdminRecruitments({
                page: page - 1,
                size: PAGE_SIZE,
                keyword: keywordInput,
                status: statusFilter
            });
            setRecruitments(res.data || []);
            setTotalElements(res.meta?.totalElements || 0);
        } catch (e: any) {
            console.error(e);
            toast.error("모집 공고 조회 실패: " + (e.message || ""));
        } finally {
            setLoading(false);
        }
    }, [page, keywordInput, statusFilter]);

    const fetchAppList = useCallback(async (recruitmentId: number) => {
        setLoadingApplications(true);
        try {
            const [appRes, matchRes] = await Promise.all([
                fetchAdminApplications(recruitmentId),
                fetchAdminMatchings(recruitmentId).catch(() => ({ data: [] }))
            ]);
            setApplications(appRes.data || []);
            setMatchingsList(matchRes.data || []);
            setSelectedMentor(null);
            setSelectedMentees([]);
        } catch (e: any) {
            console.error(e);
            toast.error("데이터 조회 실패: " + (e.message || ""));
        } finally {
            setLoadingApplications(false);
        }
    }, []);

    useEffect(() => {
        fetchRecruitList();
    }, [fetchRecruitList]);

    useEffect(() => {
        if (selectedRecruitment) {
            fetchAppList(selectedRecruitment.recruitmentId);
        }
    }, [selectedRecruitment, fetchAppList]);

    const handleMatch = () => {
        if (!selectedRecruitment || !selectedMentor || selectedMentees.length === 0) {
            toast.error("멘토와 최소 1명 이상의 멘티를 선택해주세요.");
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
                menteeApplicationIds: selectedMentees
            });
            toast.success("매칭이 완료되었습니다.");
            if (selectedRecruitment) {
                fetchAppList(selectedRecruitment.recruitmentId);
            }
        } catch (e: any) {
            console.error(e);
            toast.error("매칭 실패: " + (e.message || "서버 오류가 발생했습니다."));
        } finally {
            setMatching(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

    const recruitmentColumns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            {
                header: "학기",
                field: "semesterId",
                render: (r) => semesterOptions.find(opt => opt.value === String(r.semesterId))?.label || `${r.semesterId}학기`
            },
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
                    if (r.status === "DRAFT") return <StatusPill status="DRAFT" label="DRAFT" />;
                    if (r.status === "CLOSED") return <StatusPill status="INACTIVE" label="CLOSED" />;

                    const now = new Date();
                    const start = new Date(r.recruitStartAt);
                    const end = new Date(r.recruitEndAt);

                    if (now < start) {
                        return <StatusPill status="DRAFT" label="DRAFT" />;
                    } else if (now >= start && now <= end) {
                        return <StatusPill status="ACTIVE" label="OPEN" />;
                    } else {
                        return <StatusPill status="INACTIVE" label="CLOSED" />;
                    }
                }
            },
        ],
        [semesterOptions]
    );


    const allMentors = applications.filter(app => app.role === "MENTOR" && (app.status === "APPROVED" || app.status === "MATCHED"));
    const availableMentees = applications.filter(app => app.role === "MENTEE" && app.status === "APPROVED");
    const matchedMentees = applications.filter(app => app.role === "MENTEE" && app.status === "MATCHED");

    const STATUS_OPTIONS = [
        { value: "ALL", label: "전체 상태" },
        { value: "DRAFT", label: "작성중 (DRAFT)" },
        { value: "OPEN", label: "모집중 (OPEN)" },
        { value: "CLOSED", label: "마감 (CLOSED)" },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>멘토링 매칭 관리</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    setPage(1);
                                }}
                                options={STATUS_OPTIONS}
                                placeholder="상태 선택"
                                clearable={false}
                                showPlaceholder={false}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={keywordInput}
                                onChange={setKeywordInput}
                                onSearch={fetchRecruitList}
                                placeholder="모집 공고 제목 검색"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>

                    <div className={styles.tableWrap}>
                        <Table
                            columns={recruitmentColumns}
                            items={recruitments}
                            rowKey={(r) => r.recruitmentId}
                            loading={loading || semesterLoading}
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
                        <h2 className={styles.sectionTitle}>매칭 세부 설정: {selectedRecruitment.title}</h2>
                        <div className={styles.appCountInfo}>
                            승인된 멘토: {allMentors.length}명 / 대기중 멘티: {availableMentees.length}명 / 매칭완료 멘티: {matchedMentees.length}명
                        </div>

                        <div className={styles.matchingContainer}>
                            {/* Mentor Column */}
                            <div className={styles.matchingColumn}>
                                <h3 className={styles.colTitle}>멘토 선택 ({allMentors.length})</h3>
                                <div className={styles.cardList}>
                                    {allMentors.length === 0 && <div className={styles.emptyMsg}>승인된 멘토가 없습니다.</div>}
                                    {allMentors.map(mentor => (
                                        <div
                                            key={mentor.applicationId}
                                            className={`${styles.userCard} ${selectedMentor === mentor.applicationId ? styles.selected : ""}`}
                                            onClick={() => setSelectedMentor(mentor.applicationId)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.cardName}>{mentor.name || mentor.loginId}</span>
                                                {mentor.status === "MATCHED" && <span className={styles.matchedBadge}>매칭됨</span>}
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>학과: {mentor.deptName || "-"}</span>
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>신청일: {new Date(mentor.appliedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className={styles.matchingArrow}>
                                <div className={styles.arrowIcon}>➜</div>
                            </div>

                            {/* Mentee Column */}
                            <div className={styles.matchingColumn}>
                                <h3 className={styles.colTitle}>멘티 선택 ({availableMentees.length})</h3>
                                <div className={styles.cardList}>
                                    {availableMentees.length === 0 && <div className={styles.emptyMsg}>매칭 대기중인 멘티가 없습니다.</div>}
                                    {availableMentees.map(mentee => (
                                        <div
                                            key={mentee.applicationId}
                                            className={`${styles.userCard} ${selectedMentees.includes(mentee.applicationId) ? styles.selected : ""}`}
                                            onClick={() => {
                                                setSelectedMentees(prev =>
                                                    prev.includes(mentee.applicationId)
                                                        ? prev.filter(id => id !== mentee.applicationId)
                                                        : [...prev, mentee.applicationId]
                                                );
                                            }}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.cardName}>{mentee.name || mentee.loginId}</span>
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>학과: {mentee.deptName || "-"}</span>
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>신청일: {new Date(mentee.appliedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.matchActionRow}>
                            <Button
                                onClick={handleMatch}
                                disabled={!selectedMentor || selectedMentees.length === 0}
                            >
                                매칭 확정
                            </Button>
                        </div>

                        {/* Matched List */}
                        <div className={styles.matchedListSection}>
                            <h3 className={styles.colTitle}>매칭 완료 목록 ({matchingsList.length})</h3>
                            <div className={styles.cardListHorizontal}>
                                {matchingsList.length === 0 && <div className={styles.emptyMsg}>아직 매칭된 건이 없습니다.</div>}
                                {matchingsList.map(m => (
                                    <div key={m.matchingId} className={styles.userCardSimple}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardName}>{m.mentorName} &amp; {m.menteeName}</span>
                                            <span className={styles.matchedBadge}>매칭완료</span>
                                        </div>
                                        <div className={styles.cardInfo}>
                                            <span>매칭일: {new Date(m.matchedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
