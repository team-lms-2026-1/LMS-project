"use client";

import { useState, useEffect } from "react";
import styles from "../styles/mentoring.module.css";
import {
    createRecruitment,
    updateRecruitment,
    deleteRecruitment
} from "../api/mentoringApi";
import { useMentoringRecruitmentList } from "../hooks/useMentoringRecruitmentList";
import { MentoringRecruitmentsTable } from "./MentoringRecruitmentsTable";
import type { MentoringRecruitment, MentoringRecruitmentCreateRequest } from "../api/types";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import { SearchBar } from "@/components/searchbar/SearchBar";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useSemestersDropdownOptions } from "@/features/dropdowns/semesters/hooks";
import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
import { Dropdown } from "@/features/dropdowns/_shared";

const PAGE_SIZE = 10;

export default function MentoringRecruitmentList() {
    const {
        items,
        meta,
        loading: listLoading,
        page,
        setPage,
        searchKeyword,
        setSearchKeyword,
        handleSearch,
        refresh,
        status,
        setStatus
    } = useMentoringRecruitmentList(PAGE_SIZE);

    const { options: semesterOptions, loading: semesterLoading } = useSemestersDropdownOptions();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [closeSignal, setCloseSignal] = useState(0);

    const [formData, setFormData] = useState<MentoringRecruitmentCreateRequest & { status?: string }>({
        semesterId: 0,
        title: "",
        description: "",
        recruitStartAt: "",
        recruitEndAt: "",
        status: "DRAFT"
    });

    useEffect(() => {
        if (semesterOptions.length > 0 && !editingId && formData.semesterId === 0) {
            setFormData(prev => ({ ...prev, semesterId: Number(semesterOptions[0].value) }));
        }
    }, [semesterOptions, editingId, formData.semesterId]);

    const resetForm = () => {
        setFormData({
            semesterId: semesterOptions.length > 0 ? Number(semesterOptions[0].value) : 0,
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
            // DatePickerInput expects "yyyy-MM-dd"
            recruitStartAt: recruitment.recruitStartAt ? recruitment.recruitStartAt.substring(0, 10) : "",
            recruitEndAt: recruitment.recruitEndAt ? recruitment.recruitEndAt.substring(0, 10) : "",
            status: recruitment.status
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCloseSignal(v => v + 1);
        setIsModalOpen(false);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        const id = deleteTargetId;
        setDeleteTargetId(null);

        try {
            setDeleting(true);
            await deleteRecruitment(id);
            toast.success("삭제되었습니다.");
            refresh();
        } catch (e: any) {
            console.error(e);
            toast.error("삭제 실패: " + (e.message || "Unknown error"));
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        if (formData.semesterId === 0) {
            toast.error("학기를 선택해주세요.");
            return;
        }
        if (!formData.recruitStartAt || !formData.recruitEndAt) {
            toast.error("모집 기간을 선택해주세요.");
            return;
        }

        try {
            const payload = {
                ...formData,
                recruitStartAt: `${formData.recruitStartAt}T00:00:00`,
                recruitEndAt: `${formData.recruitEndAt}T23:59:59`,
            };

            if (editingId) {
                await updateRecruitment(editingId, payload);
                toast.success("수정되었습니다.");
            } else {
                await createRecruitment(payload);
                toast.success("등록되었습니다.");
            }

            handleCloseModal();
            resetForm();
            refresh();
        } catch (e: any) {
            console.error(e);
            toast.error("저장 실패: " + (e.message || "Unknown error"));
        }
    };

    const totalPages = meta?.totalPages || 1;

    const STATUS_OPTIONS = [
        { value: "ALL", label: "전체 상태" },
        { value: "DRAFT", label: "작성중 (DRAFT)" },
        { value: "OPEN", label: "모집중 (OPEN)" },
        { value: "CLOSED", label: "마감 (CLOSED)" },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>멘토링 모집 공고 등록</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={status}
                                onChange={(val) => {
                                    setStatus(val);
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
                                value={searchKeyword}
                                onChange={setSearchKeyword}
                                onSearch={() => handleSearch(searchKeyword)}
                                placeholder="모집 공고 검색..."
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrap}>
                    <MentoringRecruitmentsTable
                        items={items}
                        loading={listLoading || semesterLoading}
                        onEdit={handleOpenEdit}
                        onDelete={(id) => setDeleteTargetId(id)}
                        semesterOptions={semesterOptions}
                    />
                </div>

                <div className={styles.footerRow}>
                    <div className={styles.footerLeft} />
                    <div className={styles.footerCenter}>
                        <PaginationSimple
                            page={page}
                            totalPages={totalPages}
                            onChange={setPage}
                        />
                    </div>
                    <div className={styles.footerRight}>
                        <Button onClick={handleOpenCreate}>등록</Button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "멘토링 모집 수정" : "멘토링 모집 등록"}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>취소</Button>
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
                    <label className={styles.label}>학기</label>
                    <select
                        className={styles.input}
                        value={formData.semesterId}
                        onChange={(e) => setFormData({ ...formData, semesterId: Number(e.target.value) })}
                    >
                        <option value={0} disabled>학기를 선택해주세요</option>
                        {semesterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>설명</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="설명을 입력해주세요"
                        rows={4}
                    />
                </div>
                <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>시작 일시</label>
                        <DatePickerInput
                            value={formData.recruitStartAt}
                            onChange={(v) => {
                                setFormData({ ...formData, recruitStartAt: v });
                                if (formData.recruitEndAt && v > formData.recruitEndAt) {
                                    setFormData(prev => ({ ...prev, recruitEndAt: "" }));
                                }
                            }}
                            placeholder="시작일 선택"
                            closeSignal={closeSignal}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>종료 일시</label>
                        <DatePickerInput
                            value={formData.recruitEndAt}
                            onChange={(v) => setFormData({ ...formData, recruitEndAt: v })}
                            placeholder="종료일 선택"
                            min={formData.recruitStartAt || undefined}
                            closeSignal={closeSignal}
                        />
                    </div>
                </div>
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
