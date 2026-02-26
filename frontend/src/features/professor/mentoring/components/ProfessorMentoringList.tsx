"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import { useI18n } from "@/i18n/useI18n";

const PAGE_SIZE = 10;

export default function ProfessorMentoringList() {
    const tApply = useI18n("mentoring.professorApply");

    const [page, setPage] = useState(1);
    const [items, setItems] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [selectedRecruitment, setSelectedRecruitment] = useState<MentoringRecruitment | null>(null);

    const getRecruitmentStatusLabel = (status: "DRAFT" | "OPEN" | "CLOSED") => {
        if (status === "DRAFT") return tApply("table.recruitmentStatusLabel.DRAFT");
        if (status === "OPEN") return tApply("table.recruitmentStatusLabel.OPEN");
        return tApply("table.recruitmentStatusLabel.CLOSED");
    };

    const getApplicationStatusLabel = (status: string) => {
        if (status === "APPLIED") return tApply("table.applicationStatusLabel.APPLIED");
        if (status === "APPROVED") return tApply("table.applicationStatusLabel.APPROVED");
        if (status === "REJECTED") return tApply("table.applicationStatusLabel.REJECTED");
        if (status === "MATCHED") return tApply("table.applicationStatusLabel.MATCHED");
        if (status === "CANCELED") return tApply("table.applicationStatusLabel.CANCELED");
        return status;
    };

    const getRoleLabel = (role: "MENTOR" | "MENTEE") => {
        if (role === "MENTOR") return tApply("table.roleLabel.MENTOR");
        return tApply("table.roleLabel.MENTEE");
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchRecruitments("professor", {
                page: page - 1,
                size: PAGE_SIZE,
                keyword: keywordInput,
                status: "OPEN"
            });

            setItems(res?.data || []);
            setTotalElements(res.meta?.totalElements || 0);
        } catch (e: unknown) {
            console.error(e);
            const message = e instanceof Error ? e.message : "";
            toast.error(tApply("messages.dataLoadFailedPrefix") + (message || tApply("messages.unknownError")));
        } finally {
            setLoading(false);
        }
    }, [keywordInput, page, tApply]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

    const columns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            { header: tApply("table.headers.semester"), field: "semesterName" },
            { header: tApply("table.headers.title"), field: "title" },
            {
                header: tApply("table.headers.period"),
                field: "recruitStartAt",
                render: (r) => `${r.recruitStartAt.split("T")[0]} ~ ${r.recruitEndAt.split("T")[0]}`
            },
            {
                header: tApply("table.headers.recruitmentStatus"),
                field: "status",
                render: (r) => {
                    if (r.status === "DRAFT") {
                        return <StatusPill status="DRAFT" label={getRecruitmentStatusLabel("DRAFT")} />;
                    }
                    if (r.status === "OPEN") {
                        return <StatusPill status="ACTIVE" label={getRecruitmentStatusLabel("OPEN")} />;
                    }
                    return <StatusPill status="INACTIVE" label={getRecruitmentStatusLabel("CLOSED")} />;
                }
            },
            {
                header: tApply("table.headers.myApplication"),
                field: "applyStatus",
                align: "center",
                render: (r) =>
                    r.applyStatus ? (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.8rem", color: "#666" }}>
                                ({getRoleLabel((r.appliedRole as "MENTOR" | "MENTEE") || "MENTOR")})
                            </span>
                            <StatusPill
                                status={
                                    r.applyStatus === "APPROVED" || r.applyStatus === "MATCHED"
                                        ? "ACTIVE"
                                        : r.applyStatus === "REJECTED"
                                            ? "INACTIVE"
                                            : "PENDING"
                                }
                                label={getApplicationStatusLabel(r.applyStatus)}
                            />
                        </div>
                    ) : (
                        <span style={{ color: "#ccc" }}>{tApply("table.notApplied")}</span>
                    )
            },
            {
                header: tApply("table.headers.createdAt"),
                field: "recruitStartAt",
                render: (r) => r.recruitStartAt.split("T")[0]
            }
        ],
        [tApply]
    );

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tApply("title")}</h1>

                <div className={styles.searchRow}>
                    <SearchBar
                        value={keywordInput}
                        onChange={setKeywordInput}
                        onSearch={fetchData}
                        placeholder={tApply("search.placeholder")}
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
                        emptyText={tApply("table.emptyText")}
                        onRowClick={(row) => {
                            if (row.applyStatus) {
                                toast.error(tApply("messages.alreadyApplied"));
                                return;
                            }

                            const now = new Date();
                            const start = new Date(row.recruitStartAt);
                            const end = new Date(row.recruitEndAt);

                            if (now < start || now > end) {
                                toast.error(tApply("messages.outOfPeriod"));
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
