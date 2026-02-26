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
import { DatePickerInput } from "@/features/admin/authority/semesters/components/ui/DatePickerInput";
import { Dropdown } from "@/features/dropdowns/_shared";
import { useI18n } from "@/i18n/useI18n";

const PAGE_SIZE = 10;

export default function MentoringRecruitmentList() {
    const tList = useI18n("mentoring.recruitments.list");
    const tCommon = useI18n("mentoring.recruitments.common");

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
            toast.success(tList("messages.deleteSuccess"));
            refresh();
        } catch (e: any) {
            console.error(e);
            toast.error(tList("messages.deleteFailedPrefix") + (e.message || tList("messages.unknownError")));
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        if (formData.semesterId === 0) {
            toast.error(tList("messages.validationSemester"));
            return;
        }
        if (!formData.recruitStartAt || !formData.recruitEndAt) {
            toast.error(tList("messages.validationPeriod"));
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
                toast.success(tList("messages.updateSuccess"));
            } else {
                await createRecruitment(payload);
                toast.success(tList("messages.createSuccess"));
            }

            handleCloseModal();
            resetForm();
            refresh();
        } catch (e: any) {
            console.error(e);
            toast.error(tList("messages.saveFailedPrefix") + (e.message || tList("messages.unknownError")));
        }
    };

    const totalPages = meta?.totalPages || 1;

    const STATUS_OPTIONS = [
        { value: "ALL", label: tCommon("statusOption.ALL") },
        { value: "DRAFT", label: tCommon("statusOption.DRAFT") },
        { value: "OPEN", label: tCommon("statusOption.OPEN") },
        { value: "CLOSED", label: tCommon("statusOption.CLOSED") },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tList("title")}</h1>

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
                                placeholder={tList("search.statusPlaceholder")}
                                clearable={false}
                                showPlaceholder={false}
                                className={styles.dropdownFit}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={searchKeyword}
                                onChange={setSearchKeyword}
                                onSearch={() => handleSearch(searchKeyword)}
                                placeholder={tList("search.keywordPlaceholder")}
                                className={styles.searchBarFit}
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
                        <Button onClick={handleOpenCreate}>{tList("buttons.register")}</Button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? tList("modal.titleEdit") : tList("modal.titleCreate")}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>{tList("modal.buttons.cancel")}</Button>
                        <Button onClick={handleSave}>{editingId ? tList("modal.buttons.saveEdit") : tList("modal.buttons.saveCreate")}</Button>
                    </>
                }
            >
                <div className={styles.formGroup}>
                    <label className={styles.label}>{tList("modal.fields.title")}</label>
                    <input
                        className={styles.input}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={tList("modal.placeholders.title")}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{tList("modal.fields.semester")}</label>
                    <select
                        className={styles.input}
                        value={formData.semesterId}
                        onChange={(e) => setFormData({ ...formData, semesterId: Number(e.target.value) })}
                    >
                        <option value={0} disabled>{tList("modal.placeholders.semester")}</option>
                        {semesterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{tList("modal.fields.description")}</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={tList("modal.placeholders.description")}
                        rows={4}
                    />
                </div>
                <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{tList("modal.fields.startAt")}</label>
                        <DatePickerInput
                            value={formData.recruitStartAt}
                            onChange={(v) => {
                                setFormData({ ...formData, recruitStartAt: v });
                                if (formData.recruitEndAt && v > formData.recruitEndAt) {
                                    setFormData(prev => ({ ...prev, recruitEndAt: "" }));
                                }
                            }}
                            placeholder={tList("modal.placeholders.startAt")}
                            closeSignal={closeSignal}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{tList("modal.fields.endAt")}</label>
                        <DatePickerInput
                            value={formData.recruitEndAt}
                            onChange={(v) => setFormData({ ...formData, recruitEndAt: v })}
                            placeholder={tList("modal.placeholders.endAt")}
                            min={formData.recruitStartAt || undefined}
                            closeSignal={closeSignal}
                        />
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                open={!!deleteTargetId}
                message={tList("confirmDelete.message")}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTargetId(null)}
                loading={deleting}
                type="danger"
            />
        </div>
    );
}
