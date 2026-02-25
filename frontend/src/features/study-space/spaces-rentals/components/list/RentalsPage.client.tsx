"use client";

import { useState } from "react";
import styles from "./RentalsPage.module.css";
import { useRentalsList } from "../../hooks/useRentalsList";
import RentalsTable from "./RentalsTable";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple } from "@/components/pagination";
import RejectedModal from "../modal/RejectedModal";
import ApproveModal from "../modal/ApproveModal";
import { useI18n } from "@/i18n/useI18n";

export default function RentalsPageClient() {
    const { data, meta, loading, updateParams, approveRental, rejectRental } = useRentalsList();
    const t = useI18n("studySpace.admin.rentals.list");
    const [keyword, setKeyword] = useState("");

    // Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approveRentalId, setApproveRentalId] = useState<number | null>(null);

    const onSearch = () => {
        updateParams({ keyword, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        updateParams({ page: newPage });
    };

    // 반려 버튼 클릭 시 모달 오픈
    const onRejectClick = (id: number) => {
        setSelectedRentalId(id);
        setRejectModalOpen(true);
    };

    const onApproveClick = (id: number) => {
        setApproveRentalId(id);
        setApproveModalOpen(true);
    };

    // 모달에서 확인 클릭 시 실제 반려 처리
    const onRejectConfirm = (reason: string) => {
        if (selectedRentalId) {
            rejectRental(selectedRentalId, reason);
        }
        setRejectModalOpen(false);
        setSelectedRentalId(null);
    };

    const onApproveConfirm = () => {
        if (approveRentalId) {
            approveRental(approveRentalId);
        }
        setApproveModalOpen(false);
        setApproveRentalId(null);
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.headerRow}>
                <div className={styles.leftGroup}>
                    <div className={styles.breadcrumb}>
                        <span className={styles.homeIcon}>🏠</span>
                        <span>{">"}</span>
                        <span>{t("breadcrumb.current")}</span>
                    </div>
                    <h1 className={styles.title}>{t("title")}</h1>
                </div>

                {/* Search */}
                <div style={{ width: 300 }}>
                    <SearchBar
                        value={keyword}
                        onChange={setKeyword}
                        onSearch={onSearch}
                        placeholder={t("searchPlaceholder")}
                    />
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <RentalsTable
                    data={data}
                    loading={loading}
                    onApprove={onApproveClick}
                    onReject={onRejectClick}
                />
            </div>

            {/* Pagination (공용 컴포넌트) - Footer 위치로 이동 */}
            {meta && (
                <div className={styles.paginationFooter}>
                    <PaginationSimple
                        page={meta.page}
                        totalPages={meta.totalPages}
                        onChange={handlePageChange}
                    />
                </div>
            )}

            {/* 반려 사유 모달 */}
            <RejectedModal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={onRejectConfirm}
            />
            <ApproveModal
                open={approveModalOpen}
                onClose={() => {
                    setApproveModalOpen(false);
                    setApproveRentalId(null);
                }}
                onConfirm={onApproveConfirm}
            />
        </div>
    );
}
