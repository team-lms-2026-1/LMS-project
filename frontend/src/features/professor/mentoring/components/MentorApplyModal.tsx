"use client";

import { useState } from "react";
import styles from "./ProfessorMentoring.module.css";
import { MentoringRecruitment } from "@/features/mentoring/api/types";
import { applyMentoring } from "@/features/mentoring/api/mentoringApi";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useI18n } from "@/i18n/useI18n";

interface MentorApplyModalProps {
    recruitment: MentoringRecruitment;
    onClose: () => void;
    onSuccess: () => void;
}

export function MentorApplyModal({ recruitment, onClose, onSuccess }: MentorApplyModalProps) {
    const tApply = useI18n("mentoring.professorApply");

    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = () => {
        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setShowConfirm(false);
        try {
            setSubmitting(true);
            await applyMentoring("professor", {
                recruitmentId: recruitment.recruitmentId,
                role: "MENTOR"
            });
            toast.success(tApply("messages.applySuccess"));
            onSuccess();
        } catch (e: unknown) {
            console.error(e);
            const message = e instanceof Error ? e.message : "";
            toast.error(tApply("messages.applyFailedPrefix") + (message || tApply("messages.unknownError")));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            title={tApply("modal.title")}
            size="md"
            footer={
                <div className={styles.buttonGroup}>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        {tApply("modal.buttons.cancel")}
                    </Button>
                    <Button onClick={handleSubmit} loading={submitting}>
                        {tApply("modal.buttons.apply")}
                    </Button>
                </div>
            }
        >
            <div className={styles.formGroup}>
                <label>{tApply("modal.fields.recruitmentTitle")}</label>
                <div className={styles.readOnlyText}>{recruitment.title}</div>
            </div>

            <div className={styles.formGroup}>
                <label>{tApply("modal.fields.description")}</label>
                <div className={styles.readOnlyText}>{recruitment.description}</div>
            </div>

            <div className={styles.row}>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label>{tApply("modal.fields.recruitStartAt")}</label>
                        <div className={styles.readOnlyText}>{recruitment.recruitStartAt.split("T")[0]}</div>
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label>{tApply("modal.fields.recruitEndAt")}</label>
                        <div className={styles.readOnlyText}>{recruitment.recruitEndAt.split("T")[0]}</div>
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>{tApply("modal.fields.appliedRole")}</label>
                <div className={styles.readOnlyText}>{tApply("modal.fields.appliedRoleValue")}</div>
            </div>

            <div className={styles.infoBox}>
                <p>{tApply("modal.info.first")}</p>
                <p>{tApply("modal.info.second")}</p>
            </div>

            <ConfirmModal
                open={showConfirm}
                message={tApply("confirm.message")}
                onConfirm={confirmSubmit}
                onCancel={() => setShowConfirm(false)}
                loading={submitting}
            />
        </Modal>
    );
}
