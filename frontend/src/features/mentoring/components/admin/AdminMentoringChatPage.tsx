"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./adminMentoring.module.css";
import { fetchAdminRecruitments, fetchAdminMatchings } from "../../api/mentoringApi";
import { MentoringRecruitment, MentoringMatchingAdminResponse } from "../../api/types";
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
import { useI18n } from "@/i18n/useI18n";

const PAGE_SIZE = 10;

export default function AdminMentoringChatPage() {
    const tCommon = useI18n("mentoring.recruitments.common");
    const tRecruitTable = useI18n("mentoring.recruitments.table");
    const tChat = useI18n("mentoring.chatHistory");

    const [page, setPage] = useState(1);
    const [recruitments, setRecruitments] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [selectedRecruitment, setSelectedRecruitment] = useState<MentoringRecruitment | null>(null);

    const [matchingsList, setMatchingsList] = useState<MentoringMatchingAdminResponse[]>([]);
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<MentoringMatchingAdminResponse | null>(null);

    const { options: semesterOptions, loading: semesterLoading } = useSemestersDropdownOptions();
    const [statusFilter, setStatusFilter] = useState("ALL");

    const toMessage = (prefixKey: string, e: unknown) => {
        const message = e instanceof Error ? e.message : "";
        return tChat(prefixKey) + (message || tChat("messages.unknownError"));
    };

    const getRecruitmentStatusLabel = (status: "DRAFT" | "OPEN" | "CLOSED") => {
        if (status === "DRAFT") return tCommon("statusLabel.DRAFT");
        if (status === "OPEN") return tCommon("statusLabel.OPEN");
        return tCommon("statusLabel.CLOSED");
    };

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
        } catch (e: unknown) {
            console.error(e);
            toast.error(toMessage("messages.recruitmentsFetchFailedPrefix", e));
        } finally {
            setLoading(false);
        }
    }, [page, keywordInput, statusFilter, tChat]);

    const fetchMatchList = useCallback(async (recruitmentId: number) => {
        try {
            const matchRes = await fetchAdminMatchings(recruitmentId);
            setMatchingsList((matchRes.data || []) as MentoringMatchingAdminResponse[]);
        } catch (e: unknown) {
            console.error(e);
            toast.error(toMessage("messages.dataFetchFailedPrefix", e));
        }
    }, [tChat]);

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
                header: tRecruitTable("headers.semester"),
                field: "semesterId",
                render: (r) => semesterOptions.find((opt) => opt.value === String(r.semesterId))?.label || tCommon("semesterFallback", { id: r.semesterId })
            },
            { header: tRecruitTable("headers.title"), field: "title" },
            {
                header: tRecruitTable("headers.period"),
                field: "recruitStartAt",
                render: (r) => {
                    const format = (dt: string) => dt ? dt.replace("T", " ").substring(0, 16) : "-";
                    return `${format(r.recruitStartAt)} ~ ${format(r.recruitEndAt)}`;
                }
            },
            {
                header: tRecruitTable("headers.status"),
                field: "status",
                render: (r) => {
                    if (r.status === "DRAFT") return <StatusPill status="DRAFT" label={getRecruitmentStatusLabel("DRAFT")} />;
                    if (r.status === "CLOSED") return <StatusPill status="INACTIVE" label={getRecruitmentStatusLabel("CLOSED")} />;

                    const now = new Date();
                    const start = new Date(r.recruitStartAt);
                    const end = new Date(r.recruitEndAt);

                    if (now < start) {
                        return <StatusPill status="DRAFT" label={getRecruitmentStatusLabel("DRAFT")} />;
                    } else if (now >= start && now <= end) {
                        return <StatusPill status="ACTIVE" label={getRecruitmentStatusLabel("OPEN")} />;
                    } else {
                        return <StatusPill status="INACTIVE" label={getRecruitmentStatusLabel("CLOSED")} />;
                    }
                }
            }
        ],
        [semesterOptions, tCommon, tRecruitTable]
    );

    const statusOptions = [
        { value: "ALL", label: tCommon("statusOption.ALL") },
        { value: "DRAFT", label: tCommon("statusOption.DRAFT") },
        { value: "OPEN", label: tCommon("statusOption.OPEN") },
        { value: "CLOSED", label: tCommon("statusOption.CLOSED") }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tChat("title")}</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    setPage(1);
                                }}
                                options={statusOptions}
                                placeholder={tChat("search.statusPlaceholder")}
                                clearable={false}
                                showPlaceholder={false}
                                className={styles.dropdownFit}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={keywordInput}
                                onChange={setKeywordInput}
                                onSearch={fetchRecruitList}
                                placeholder={tChat("search.keywordPlaceholder")}
                                className={styles.searchBarFit}
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
                            emptyText={tChat("recruitments.emptyText")}
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
                            {tChat("sectionTitle", { title: selectedRecruitment.title })}
                        </h2>

                        <div className={styles.matchedListSection}>
                            <h3 className={styles.colTitle}>
                                {tChat("columns.matchedListTitle", { count: matchingsList.length })}
                            </h3>
                            <div className={styles.cardListHorizontal}>
                                {matchingsList.length === 0 && (
                                    <div className={styles.emptyMsg}>{tChat("columns.emptyMatchedList")}</div>
                                )}
                                {matchingsList.map((m) => (
                                    <div key={m.matchingId} className={styles.userCardSimple}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardName}>{m.mentorName} &amp; {m.menteeName}</span>
                                            <span className={styles.matchedBadge}>{tChat("badges.matchedComplete")}</span>
                                        </div>
                                        <div className={styles.cardInfo}>
                                            <span>{tChat("labels.matchedAt")}: {new Date(m.matchedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ marginTop: "12px", textAlign: "right" }}>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setSelectedChat(m);
                                                    setChatModalOpen(true);
                                                }}
                                            >
                                                {tChat("buttons.viewChat")}
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
                recruitmentTitle={selectedChat?.recruitmentTitle || selectedRecruitment?.title || ""}
            />
        </div>
    );
}
