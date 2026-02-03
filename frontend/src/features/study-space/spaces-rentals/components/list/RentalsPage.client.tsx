"use client";

import { useState } from "react";
import styles from "./RentalsPage.module.css";
import { useRentalsList } from "../../hooks/useRentalsList";
import RentalsTable from "./RentalsTable";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple } from "@/components/pagination";

export default function RentalsPageClient() {
    const { data, meta, loading, updateParams, approveRental, rejectRental } = useRentalsList();
    const [keyword, setKeyword] = useState("");

    const onSearch = () => {
        updateParams({ keyword, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        updateParams({ page: newPage });
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.headerRow}>
                <div className={styles.leftGroup}>
                    <div className={styles.breadcrumb}>
                        <span className={styles.homeIcon}>🏠</span>
                        <span>{">"}</span>
                        <span>학습공간 대여 관리</span>
                    </div>
                    <h1 className={styles.title}>학습공간 대여</h1>
                </div>

                {/* Search */}
                <div style={{ width: 300 }}>
                    <SearchBar
                        value={keyword}
                        onChange={setKeyword}
                        onSearch={onSearch}
                        placeholder="검색어 입력..."
                    />
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <RentalsTable
                    data={data}
                    loading={loading}
                    onApprove={approveRental}
                    onReject={rejectRental}
                />

                {/* Pagination (공용 컴포넌트) */}
                {meta && (
                    <div className={styles.pagination}>
                        <PaginationSimple
                            page={meta.page}
                            totalPages={meta.totalPages}
                            onChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
