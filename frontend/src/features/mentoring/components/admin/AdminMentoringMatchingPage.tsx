"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./adminMentoring.module.css";
import {
    fetchAdminRecruitments,
    fetchAdminApplications,
    fetchAdminMatchings,
    matchMentoring
} from "../../api/mentoringApi";
import { MentoringRecruitment, MentoringApplication } from "../../api/types";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { TableColumn } from "@/components/table/types";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Button } from "@/components/button/Button";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { Dropdown } from "@/features/dropdowns/_shared";
import { useI18n } from "@/i18n/useI18n";

const PAGE_SIZE = 10;

type MatchingItem = {
    matchingId: number;
    mentorName: string;
    menteeName: string;
    matchedAt: string;
};

export default function AdminMentoringMatchingPage() {
    const tCommon = useI18n("mentoring.recruitments.common");
    const tRecruitTable = useI18n("mentoring.recruitments.table");
    const tMatching = useI18n("mentoring.matching");

    const [page, setPage] = useState(1);
    const [recruitments, setRecruitments] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [selectedRecruitment, setSelectedRecruitment] = useState<MentoringRecruitment | null>(null);
    const [applications, setApplications] = useState<MentoringApplication[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);

    const [selectedMentor, setSelectedMentor] = useState<number | null>(null);
    const [selectedMentees, setSelectedMentees] = useState<number[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [matching, setMatching] = useState(false);
    const [matchingsList, setMatchingsList] = useState<MatchingItem[]>([]);

    const { options: semesterOptions, loading: semesterLoading } = useSemestersDropdownOptions();
    const [statusFilter, setStatusFilter] = useState("ALL");

    const toMessage = (
        prefixKey: string,
        e: unknown,
        fallbackKey: string = "messages.unknownError"
    ) => {
        const message = e instanceof Error ? e.message : "";
        return tMatching(prefixKey) + (message || tMatching(fallbackKey));
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
    }, [page, keywordInput, statusFilter, tMatching]);

    const fetchAppList = useCallback(async (recruitmentId: number) => {
        setLoadingApplications(true);
        try {
            const [appRes, matchRes] = await Promise.all([
                fetchAdminApplications(recruitmentId),
                fetchAdminMatchings(recruitmentId).catch(() => ({ data: [] }))
            ]);
            setApplications(appRes.data || []);
            setMatchingsList((matchRes.data || []) as MatchingItem[]);
            setSelectedMentor(null);
            setSelectedMentees([]);
        } catch (e: unknown) {
            console.error(e);
            toast.error(toMessage("messages.dataFetchFailedPrefix", e));
        } finally {
            setLoadingApplications(false);
        }
    }, [tMatching]);

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
            toast.error(tMatching("messages.selectionRequired"));
            return;
        }
        setIsConfirmOpen(true);
    };

    const confirmMatch = async () => {
        if (!selectedRecruitment || !selectedMentor) return;

        setIsConfirmOpen(false);
        try {
            setMatching(true);
            await matchMentoring({
                recruitmentId: selectedRecruitment.recruitmentId,
                mentorApplicationId: selectedMentor,
                menteeApplicationIds: selectedMentees
            });
            toast.success(tMatching("messages.matchSuccess"));
            await fetchAppList(selectedRecruitment.recruitmentId);
        } catch (e: unknown) {
            console.error(e);
            toast.error(toMessage("messages.matchFailedPrefix", e, "messages.serverErrorFallback"));
        } finally {
            setMatching(false);
        }
    };

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

    const allMentors = applications.filter((app) => app.role === "MENTOR" && (app.status === "APPROVED" || app.status === "MATCHED"));
    const availableMentees = applications.filter((app) => app.role === "MENTEE" && app.status === "APPROVED");
    const matchedMentees = applications.filter((app) => app.role === "MENTEE" && app.status === "MATCHED");

    const statusOptions = [
        { value: "ALL", label: tCommon("statusOption.ALL") },
        { value: "DRAFT", label: tCommon("statusOption.DRAFT") },
        { value: "OPEN", label: tCommon("statusOption.OPEN") },
        { value: "CLOSED", label: tCommon("statusOption.CLOSED") }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tMatching("title")}</h1>

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
                                placeholder={tMatching("search.statusPlaceholder")}
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
                                placeholder={tMatching("search.keywordPlaceholder")}
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
                            emptyText={tMatching("recruitments.emptyText")}
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
                            {tMatching("sectionTitle", { title: selectedRecruitment.title })}
                        </h2>
                        <div className={styles.appCountInfo}>
                            {tMatching("counts.summary", {
                                mentorCount: allMentors.length,
                                availableMenteeCount: availableMentees.length,
                                matchedMenteeCount: matchedMentees.length
                            })}
                        </div>

                        <div className={styles.matchingContainer}>
                            <div className={styles.matchingColumn}>
                                <h3 className={styles.colTitle}>
                                    {tMatching("columns.mentorTitle", { count: allMentors.length })}
                                </h3>
                                <div className={styles.cardList}>
                                    {allMentors.length === 0 && (
                                        <div className={styles.emptyMsg}>{tMatching("columns.emptyApprovedMentor")}</div>
                                    )}
                                    {allMentors.map((mentor) => (
                                        <div
                                            key={mentor.applicationId}
                                            className={`${styles.userCard} ${selectedMentor === mentor.applicationId ? styles.selected : ""}`}
                                            onClick={() => setSelectedMentor(mentor.applicationId)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.cardName}>{mentor.name || mentor.loginId}</span>
                                                {mentor.status === "MATCHED" && (
                                                    <span className={styles.matchedBadge}>{tMatching("badges.matched")}</span>
                                                )}
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>{tMatching("labels.department")}: {mentor.deptName || "-"}</span>
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>{tMatching("labels.appliedAt")}: {new Date(mentor.appliedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.matchingArrow}>
                                <div className={styles.arrowIcon}>&rarr;</div>
                            </div>

                            <div className={styles.matchingColumn}>
                                <h3 className={styles.colTitle}>
                                    {tMatching("columns.menteeTitle", { count: availableMentees.length })}
                                </h3>
                                <div className={styles.cardList}>
                                    {availableMentees.length === 0 && (
                                        <div className={styles.emptyMsg}>{tMatching("columns.emptyAvailableMentee")}</div>
                                    )}
                                    {availableMentees.map((mentee) => (
                                        <div
                                            key={mentee.applicationId}
                                            className={`${styles.userCard} ${selectedMentees.includes(mentee.applicationId) ? styles.selected : ""}`}
                                            onClick={() => {
                                                setSelectedMentees((prev) => (
                                                    prev.includes(mentee.applicationId)
                                                        ? prev.filter((id) => id !== mentee.applicationId)
                                                        : [...prev, mentee.applicationId]
                                                ));
                                            }}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.cardName}>{mentee.name || mentee.loginId}</span>
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>{tMatching("labels.department")}: {mentee.deptName || "-"}</span>
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span>{tMatching("labels.appliedAt")}: {new Date(mentee.appliedAt).toLocaleDateString()}</span>
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
                                {tMatching("buttons.confirmMatch")}
                            </Button>
                        </div>

                        <div className={styles.matchedListSection}>
                            <h3 className={styles.colTitle}>
                                {tMatching("columns.matchedListTitle", { count: matchingsList.length })}
                            </h3>
                            <div className={styles.cardListHorizontal}>
                                {matchingsList.length === 0 && (
                                    <div className={styles.emptyMsg}>{tMatching("columns.emptyMatchedList")}</div>
                                )}
                                {matchingsList.map((m) => (
                                    <div key={m.matchingId} className={styles.userCardSimple}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardName}>{m.mentorName} &amp; {m.menteeName}</span>
                                            <span className={styles.matchedBadge}>{tMatching("badges.matchedComplete")}</span>
                                        </div>
                                        <div className={styles.cardInfo}>
                                            <span>{tMatching("labels.matchedAt")}: {new Date(m.matchedAt).toLocaleDateString()}</span>
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
                message={tMatching("confirm.matchMessage")}
                onConfirm={confirmMatch}
                onCancel={() => setIsConfirmOpen(false)}
                loading={matching}
            />
        </div>
    );
}
