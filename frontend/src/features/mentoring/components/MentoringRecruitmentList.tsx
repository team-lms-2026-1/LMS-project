"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/mentoring.module.css";
import {
    fetchRecruitments,
    createRecruitment,
    updateRecruitment,
    deleteRecruitment
} from "../lib/api";
import type { MentoringRecruitment, MentoringRecruitmentCreateRequest } from "../types";
import { Table } from "@/components/table/Table";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { StatusPill } from "@/components/status/StatusPill";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";
import { SearchBar } from "@/components/searchbar/SearchBar";
import type { TableColumn } from "@/components/table/types";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

const PAGE_SIZE = 10;

export default function MentoringRecruitmentList() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [items, setItems] = useState<MentoringRecruitment[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState<MentoringRecruitmentCreateRequest & { status?: string }>({
        semesterId: 1, // Default or select
        title: "",
        description: "",
        recruitStartAt: "",
        recruitEndAt: "",
        status: "DRAFT"
    });

    const fetchData = () => {
        setLoading(true);
        fetchRecruitments({ page: page - 1, size: PAGE_SIZE }) // Spring Page is 0-indexed
            .then((res: any) => {
                setItems(res.content || []);
                setTotalElements(res.totalElements || 0);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const resetForm = () => {
        setFormData({
            semesterId: 1,
            title: "",
            description: "",
            recruitStartAt: "",
            recruitEndAt: "",
            status: "DRAFT"
        });
        setEditingId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (recruitment: MentoringRecruitment) => {
        setEditingId(recruitment.recruitmentId);
        setFormData({
            semesterId: recruitment.semesterId,
            title: recruitment.title,
            description: recruitment.description,
            recruitStartAt: recruitment.recruitStartAt ? recruitment.recruitStartAt.substring(0, 16) : "",
            recruitEndAt: recruitment.recruitEndAt ? recruitment.recruitEndAt.substring(0, 16) : "",
            status: recruitment.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        const id = deleteTargetId;
        setDeleteTargetId(null);

        try {
            setDeleting(true);
            await deleteRecruitment(id);
            toast.success("삭제되었습니다.");
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error("삭제 실패: " + (e.message || "Unknown error"));
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        try {
            const formatDateTime = (dt: string) => (dt && dt.length === 16 ? dt + ":00" : dt);
            const payload = {
                ...formData,
                recruitStartAt: formatDateTime(formData.recruitStartAt),
                recruitEndAt: formatDateTime(formData.recruitEndAt),
            };

            if (editingId) {
                await updateRecruitment(editingId, payload);
                toast.success("수정되었습니다.");
            } else {
                await createRecruitment(payload);
                toast.success("등록되었습니다.");
            }

            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error("저장 실패: " + (e.message || "Unknown error"));
        }
    };

    const columns = useMemo<TableColumn<MentoringRecruitment>[]>(
        () => [
            { header: "학기", field: "semesterId", render: (row) => `${row.semesterId}학기` },
            { header: "제목", field: "title" },
            {
                header: "모집기간",
                field: "recruitStartAt",
                render: (row) => {
                    const format = (dt: string) => dt ? dt.replace("T", " ").substring(0, 16) : "-";
                    return `${format(row.recruitStartAt)} ~ ${format(row.recruitEndAt)}`;
                }
            },
            {
                header: "상태",
                field: "status",
                align: "center",
                render: (row) => <StatusPill status={row.status === "OPEN" ? "ACTIVE" : "INACTIVE"} label={row.status} />
            },
            {
                header: "관리",
                field: "recruitmentId", // dummy
                align: "center",
                width: "220px",
                stopRowClick: true,
                render: (row) => (
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                        <Button
                            variant="secondary"
                            className={styles.smBtn}
                            onClick={() => handleOpenEdit(row)}
                        >
                            수정
                        </Button>
                        <Button
                            variant="danger"
                            className={styles.smBtn}
                            onClick={() => handleDelete(row.recruitmentId)}
                        >
                            삭제
                        </Button>
                    </div>
                )
            }
        ],
        [router]
    );

    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div className={styles.title}>멘토링 모집 공고 등록</div>
                <Button onClick={handleOpenCreate}>등록</Button>
            </div>

            <div style={{ marginBottom: 16 }}>
                <SearchBar
                    value={searchKeyword}
                    onChange={setSearchKeyword}
                    onSearch={fetchData}
                    placeholder="모집 공고 검색..."
                />
            </div>

            <div className={styles.tableWrap}>
                <Table
                    columns={columns}
                    items={items}
                    rowKey={(r) => r.recruitmentId}
                    loading={loading}
                    skeletonRowCount={PAGE_SIZE}
                    emptyText="모집 공고가 없습니다."
                />
            </div>

            <div className={styles.paginationContainer}>
                <PaginationSimple
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "멘토링 모집 수정" : "멘토링 모집 등록"}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
                        <Button onClick={handleSave}>{editingId ? "수정" : "등록"}</Button>
                    </>
                }
            >
                <div className={styles.formGroup}>
                    <label className={styles.label}>제목</label>
                    <input
                        className={styles.input}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="제목을 입력해주세요"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>학기 (ID)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.semesterId}
                        onChange={(e) => setFormData({ ...formData, semesterId: Number(e.target.value) })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>설명</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>모집 시작일</label>
                    <input
                        type="datetime-local"
                        className={styles.input}
                        value={formData.recruitStartAt}
                        onChange={(e) => setFormData({ ...formData, recruitStartAt: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>모집 종료일</label>
                    <input
                        type="datetime-local"
                        className={styles.input}
                        value={formData.recruitEndAt}
                        onChange={(e) => setFormData({ ...formData, recruitEndAt: e.target.value })}
                    />
                </div>

                {/* Status Field (Only for Edit) */}
                {editingId && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>상태</label>
                        <select
                            className={styles.input}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="DRAFT">DRAFT</option>
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                open={!!deleteTargetId}
                message="정말 삭제하시겠습니까? 신청 내역도 함께 처리될 수 있습니다."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTargetId(null)}
                loading={deleting}
                type="danger"
            />
        </div>
    );
}
