"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./adminMentoring.module.css";
import { fetchAdminRecruitments, fetchAdminApplications, fetchAdminMatchings } from "../../api/mentoringApi";
import { MentoringRecruitment, MentoringApplication } from "../../api/types";
import { AdminMentoringChatModal } from "./AdminMentoringChatModal";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Button } from "@/components/button/Button";
import toast from "react-hot-toast";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { Dropdown } from "@/features/dropdowns/_shared";

const PAGE_SIZE = 10;

export default function AdminMentoringChatPage() {
    const [page, setPage] = useState(1);
    const [recruitments, setRecruitments] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [selectedRecruitment, setSelectedRecruitment] = useState<MentoringRecruitment | null>(null);

    // Chat Modal State
    const [matchingsList, setMatchingsList] = useState<any[]>([]);
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<any>(null);

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

    const fetchMatchList = useCallback(async (recruitmentId: number) => {
        try {
            const matchRes = await fetchAdminMatchings(recruitmentId);
            setMatchingsList(matchRes.data || []);
        } catch (e: any) {
            console.error(e);
            toast.error("데이터 조회 실패: " + (e.message || ""));
        }
    }, []);

    useEffect(() => {
        fetchRecruitList();
    }, [fetchRecruitList]);

    useEffect(() => {
        if (selectedRecruitment) {
            fetchMatchList(selectedRecruitment.recruitmentId);
        }
    }, [selectedRecruitment, fetchMatchList]);

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

    const STATUS_OPTIONS = [
        { value: "ALL", label: "전체 상태" },
        { value: "DRAFT", label: "작성중 (DRAFT)" },
        { value: "OPEN", label: "모집중 (OPEN)" },
        { value: "CLOSED", label: "마감 (CLOSED)" },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>멘토링 채팅 내역 확인</h1>

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
                        <h2 className={styles.sectionTitle}>채팅 내역: {selectedRecruitment.title}</h2>

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
                                        <div style={{ marginTop: "12px", textAlign: "right" }}>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setSelectedChat(m);
                                                    setChatModalOpen(true);
                                                }}
                                            >
                                                채팅 보기
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AdminMentoringChatModal
                open={chatModalOpen}
                onClose={() => setChatModalOpen(false)}
                matchingId={selectedChat?.matchingId || null}
                mentorName={selectedChat?.mentorName || ""}
                menteeName={selectedChat?.menteeName || ""}
                recruitmentTitle={selectedChat?.recruitmentTitle || ""}
            />
        </div>
    );
}
