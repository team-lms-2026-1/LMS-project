"use client";

import { useState } from "react";
import styles from "../styles/studentMentoring.module.css";
import { MentoringRecruitment } from "@/features/mentoring/types";
import { applyMentoringStudent } from "@/features/mentoring/lib/studentApi";

interface Props {
    recruitment: MentoringRecruitment;
    onClose: () => void;
    onSuccess: () => void;
}

import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";

interface Props {
    recruitment: MentoringRecruitment;
    onClose: () => void;
    onSuccess: () => void;
}

export function ApplyModal({ recruitment, onClose, onSuccess }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: "",
    });

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await applyMentoringStudent({
                recruitmentId: recruitment.recruitmentId,
                role: "MENTEE"
            });
            alert("신청되었습니다.");
            onSuccess();
        } catch (e: any) {
            console.error(e);
            alert("신청 실패: " + (e.message || "알 수 없는 오류"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            title="멘토링 신청"
            size="md"
            footer={
                <div className={styles.buttonGroup}>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        취소
                    </Button>
                    <Button onClick={handleSubmit} loading={submitting}>
                        신청
                    </Button>
                </div>
            }
        >
            <div className={styles.formGroup}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>이름</label>
                        <input className={styles.input} type="text" placeholder="이름" />
                    </div>
                    <div className={styles.col}>
                        <label>모집명</label>
                        <input className={styles.input} type="text" value={recruitment.title} readOnly />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>학과</label>
                <input className={styles.input} type="text" placeholder="학과" />
            </div>

            <div className={styles.formGroup}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>학년</label>
                        <input className={styles.input} type="text" placeholder="학년" />
                    </div>
                    <div className={styles.col}>
                        <label>학번</label>
                        <input className={styles.input} type="text" placeholder="학번" />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>이메일</label>
                        <input className={styles.input} type="email" placeholder="email@example.com" />
                    </div>
                    <div className={styles.col}>
                        <label>연락처</label>
                        <input className={styles.input} type="tel" placeholder="010-0000-0000" />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>멘토링 신청 사유</label>
                <textarea
                    className={styles.textarea}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="신청 사유를 입력하세요"
                />
            </div>
        </Modal>
    );
}
