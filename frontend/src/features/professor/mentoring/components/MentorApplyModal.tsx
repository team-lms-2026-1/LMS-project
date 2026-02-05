"use client";

import { useState } from "react";
import styles from "./ProfessorMentoring.module.css";
import { MentoringRecruitment } from "@/features/mentoring/types";
import { applyMentoringAsMentor } from "@/features/mentoring/lib/professorApi";

interface MentorApplyModalProps {
    recruitment: MentoringRecruitment;
    onClose: () => void;
    onSuccess: () => void;
}

import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

interface MentorApplyModalProps {
    recruitment: MentoringRecruitment;
    onClose: () => void;
    onSuccess: () => void;
}

export function MentorApplyModal({ recruitment, onClose, onSuccess }: MentorApplyModalProps) {
    const [submitting, setSubmitting] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = () => {
        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setShowConfirm(false);
        try {
            setSubmitting(true);
            await applyMentoringAsMentor({
                recruitmentId: recruitment.recruitmentId,
                role: "MENTOR"
            });
            toast.success("멘토 신청이 완료되었습니다.");
            onSuccess();
        } catch (e: any) {
            console.error(e);
            toast.error("멘토 신청 실패: " + (e.message || ""));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            title="멘토 신청"
            size="md"
            footer={
                <div className={styles.buttonGroup}>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        취소
                    </Button>
                    <Button onClick={handleSubmit} loading={submitting}>
                        멘토 신청
                    </Button>
                </div>
            }
        >
            <div className={styles.formGroup}>
                <label>모집 공고 제목</label>
                <div className={styles.readOnlyText}>{recruitment.title}</div>
            </div>

            <div className={styles.formGroup}>
                <label>설명</label>
                <div className={styles.readOnlyText}>{recruitment.description}</div>
            </div>

            <div className={styles.row}>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label>모집 시작일</label>
                        <div className={styles.readOnlyText}>
                            {recruitment.recruitStartAt.split("T")[0]}
                        </div>
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label>모집 종료일</label>
                        <div className={styles.readOnlyText}>
                            {recruitment.recruitEndAt.split("T")[0]}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>신청 역할</label>
                <div className={styles.readOnlyText}>멘토 (Mentor)</div>
            </div>

            <div className={styles.infoBox}>
                <p>교수님은 멘토로 신청하실 수 있습니다.</p>
                <p>신청 후 관리자의 승인을 기다려주세요.</p>
            </div>

            <ConfirmModal
                open={showConfirm}
                message="멘토로 신청하시겠습니까?"
                onConfirm={confirmSubmit}
                onCancel={() => setShowConfirm(false)}
                loading={submitting}
            />
        </Modal>
    );
}
