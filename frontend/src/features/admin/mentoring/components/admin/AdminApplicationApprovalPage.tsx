"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./adminMentoring.module.css";
import {
    fetchAdminRecruitments,
    fetchAdminApplications,
    updateApplicationStatus
} from "../../api/mentoringApi";
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
import { useI18n } from "@/i18n/useI18n";

const PAGE_SIZE = 10;

export default function AdminApplicationApprovalPage() {
    const tCommon = useI18n("mentoring.recruitments.common");
    const tRecruitTable = useI18n("mentoring.recruitments.table");
    const tApproval = useI18n("mentoring.approval");

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
    const [statusFilter, setStatusFilter] = useState("ALL");

    const { options: semesterOptions, loading: semesterLoading } = useSemestersDropdownOptions();

    const toMessage = (prefixKey: string, e: unknown) => {
        const message = e instanceof Error ? e.message : "";
        return tApproval(prefixKey) + (message || tApproval("messages.unknownError"));
    };

    const getRecruitmentStatusLabel = (status: "DRAFT" | "OPEN" | "CLOSED") => {
        if (status === "DRAFT") return tCommon("statusLabel.DRAFT");
        if (status === "OPEN") return tCommon("statusLabel.OPEN");
        return tCommon("statusLabel.CLOSED");
    };

    const getApplicationStatusLabel = (status: string) => {
        if (status === "APPLIED") return tApproval("applications.statusLabel.APPLIED");
        if (status === "APPROVED") return tApproval("applications.statusLabel.APPROVED");
        if (status === "REJECTED") return tApproval("applications.statusLabel.REJECTED");
        if (status === "MATCHED") return tApproval("applications.statusLabel.MATCHED");
        if (status === "CANCELED") return tApproval("applications.statusLabel.CANCELED");
        return status;
    };

    const getRoleLabel = (role: "MENTOR" | "MENTEE") => {
        if (role === "MENTOR") return tApproval("applications.roleLabel.MENTOR");
        return tApproval("applications.roleLabel.MENTEE");
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
    }, [page, keywordInput, statusFilter, tApproval]);

    const fetchAppList = useCallback(async (recruitmentId: number) => {
        setLoadingApplications(true);
        try {
            const res = await fetchAdminApplications(recruitmentId);
            setApplications(res.data || []);
        } catch (e: unknown) {
            console.error(e);
            toast.error(toMessage("messages.applicationsFetchFailedPrefix", e));
        } finally {
            setLoadingApplications(false);
        }
    }, [tApproval]);

    useEffect(() => {
        fetchRecruitList();
    }, [fetchRecruitList]);

    useEffect(() => {
        if (selectedRecruitment) {
            fetchAppList(selectedRecruitment.recruitmentId);
        }
    }, [selectedRecruitment, fetchAppList]);

    const handleApprove = (applicationId: number) => {
        setConfirmApproveId(applicationId);
    };

    const confirmApprove = async () => {
        if (!confirmApproveId) return;
        const id = confirmApproveId;
        setConfirmApproveId(null);

        try {
            setProcessingId(id);
            await updateApplicationStatus(id, { status: "APPROVED" });
            toast.success(tApproval("messages.approveSuccess"));
            if (selectedRecruitment) {
                fetchAppList(selectedRecruitment.recruitmentId);
            }
        } catch (e: unknown) {
            console.error(e);
            toast.error(toMessage("messages.approveFailedPrefix", e));
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
            toast.error(tApproval("messages.rejectReasonRequired"));
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
            toast.success(tApproval("messages.rejectSuccess"));
            if (selectedRecruitment) {
                fetchAppList(selectedRecruitment.recruitmentId);
            }
        } catch (e: unknown) {
            console.error(e);
            toast.error(toMessage("messages.rejectFailedPrefix", e));
        } finally {
            setProcessingId(null);
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
            },
        ],
        [semesterOptions, tCommon, tRecruitTable]
    );

    const applicationColumns = useMemo<TableColumn<MentoringApplication>[]>(
        () => [
            {
                header: tApproval("applications.headers.name"),
                field: "name",
                render: (a) => a.name || a.loginId
            },
            {
                header: tApproval("applications.headers.role"),
                field: "role",
                render: (a) => (
                    <span className={a.role === "MENTOR" ? styles.mentorBadge : styles.menteeBadge}>
                        {getRoleLabel(a.role)}
                    </span>
                )
            },
            {
                header: tApproval("applications.headers.status"),
                field: "status",
                align: "center",
                render: (a) => (
                    <StatusPill
                        status={
                            a.status === "APPROVED" || a.status === "MATCHED"
                                ? "ACTIVE"
                                : a.status === "REJECTED"
                                    ? "INACTIVE"
                                    : "PENDING"
                        }
                        label={getApplicationStatusLabel(a.status)}
                    />
                )
            },
            {
                header: tApproval("applications.headers.appliedAt"),
                field: "appliedAt",
                render: (a) => new Date(a.appliedAt).toLocaleDateString()
            },
            {
                header: tApproval("applications.headers.actions"),
                field: "applicationId",
                stopRowClick: true,
                render: (a) => {
                    if (a.status !== "APPLIED") {
                        return <span className={styles.noAction}>{tApproval("applications.actions.noAction")}</span>;
                    }
                    return (
                        <div className={styles.actionButtons}>
                            <Button
                                variant="primary"
                                onClick={() => handleApprove(a.applicationId)}
                                loading={processingId === a.applicationId}
                            >
                                {tApproval("applications.actions.approve")}
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleReject(a.applicationId)}
                                loading={processingId === a.applicationId}
                            >
                                {tApproval("applications.actions.reject")}
                            </Button>
                        </div>
                    );
                }
            }
        ],
        [processingId, tApproval]
    );

    const statusOptions = [
        { value: "ALL", label: tCommon("statusOption.ALL") },
        { value: "DRAFT", label: tCommon("statusOption.DRAFT") },
        { value: "OPEN", label: tCommon("statusOption.OPEN") },
        { value: "CLOSED", label: tCommon("statusOption.CLOSED") },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tApproval("title")}</h1>

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
                                placeholder={tApproval("search.statusPlaceholder")}
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
                                placeholder={tApproval("search.keywordPlaceholder")}
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
                            emptyText={tApproval("recruitments.emptyText")}
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
                            {tApproval("applications.sectionTitle", { title: selectedRecruitment.title })}
                        </h2>

                        {loadingApplications ? (
                            <div className={styles.loadingText}>{tApproval("applications.loadingText")}</div>
                        ) : (
                            <div className={styles.tableWrap}>
                                <Table
                                    columns={applicationColumns}
                                    items={applications}
                                    rowKey={(a) => a.applicationId}
                                    loading={false}
                                    emptyText={tApproval("applications.emptyText")}
                                    onRowClick={(a) => setViewApp(a)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Modal
                open={!!viewApp}
                title={tApproval("applications.detailModal.title")}
                onClose={() => setViewApp(null)}
                footer={<Button onClick={() => setViewApp(null)}>{tApproval("applications.detailModal.buttons.close")}</Button>}
            >
                {viewApp && (
                    <div className={styles.appDetail}>
                        <div className={styles.appInfoGrid}>
                            <div><strong>{tApproval("applications.detailModal.fields.name")}:</strong> {viewApp.name}</div>
                            <div><strong>{tApproval("applications.detailModal.fields.loginId")}:</strong> {viewApp.loginId}</div>
                            <div><strong>{tApproval("applications.detailModal.fields.deptName")}:</strong> {viewApp.deptName || "-"}</div>
                            <div><strong>{tApproval("applications.detailModal.fields.phone")}:</strong> {viewApp.phone || "-"}</div>
                            {viewApp.studentNo && <div><strong>{tApproval("applications.detailModal.fields.studentNo")}:</strong> {viewApp.studentNo}</div>}
                            {viewApp.gradeLevel && <div><strong>{tApproval("applications.detailModal.fields.gradeLevel")}:</strong> {viewApp.gradeLevel}</div>}
                            <div><strong>{tApproval("applications.detailModal.fields.email")}:</strong> {viewApp.email || "-"}</div>
                        </div>
                        <div className={styles.divider} />
                        <div><strong>{tApproval("applications.detailModal.fields.role")}:</strong> {getRoleLabel(viewApp.role)}</div>
                        <div><strong>{tApproval("applications.detailModal.fields.appliedAt")}:</strong> {new Date(viewApp.appliedAt).toLocaleString()}</div>
                        <div>
                            <strong>{tApproval("applications.detailModal.fields.applyReason")}:</strong>
                            <div className={styles.appReasonBox}>
                                {viewApp.applyReason || tApproval("applications.detailModal.reasonEmpty")}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                open={!!confirmApproveId}
                message={tApproval("confirm.approveMessage")}
                onConfirm={confirmApprove}
                onCancel={() => setConfirmApproveId(null)}
                loading={processingId !== null}
            />

            <Modal
                open={!!rejectTargetId}
                title={tApproval("confirm.rejectTitle")}
                onClose={() => setRejectTargetId(null)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setRejectTargetId(null)}>
                            {tApproval("confirm.buttons.cancel")}
                        </Button>
                        <Button variant="danger" onClick={confirmReject} loading={processingId !== null}>
                            {tApproval("confirm.buttons.reject")}
                        </Button>
                    </>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                        <label className={styles.formLabel}>{tApproval("confirm.rejectReasonLabel")}</label>
                        <textarea
                            className={styles.textarea}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder={tApproval("confirm.rejectReasonPlaceholder")}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
