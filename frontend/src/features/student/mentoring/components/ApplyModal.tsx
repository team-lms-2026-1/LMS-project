"use client";

import { useEffect, useState } from "react";
import styles from "../styles/studentMentoring.module.css";
import { MentoringRecruitment } from "@/features/mentoring/api/types";
import { applyMentoring } from "@/features/mentoring/api/mentoringApi";
import { getJson } from "@/lib/http";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";
import toast from "react-hot-toast";

interface Props {
    recruitment: MentoringRecruitment;
    onClose: () => void;
    onSuccess: () => void;
}

export function ApplyModal({ recruitment, onClose, onSuccess }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        deptName: "",
        gradeLevel: "",
        studentNo: "",
        email: "",
        phone: "",
        reason: "",
    });

    useEffect(() => {
        // Fetch user profile
        getJson<any>("/api/accounts/me")
            .then((res) => {
                if (res.data) {
                    const p = res.data;
                    setFormData(prev => ({
                        ...prev,
                        name: p.name || "",
                        deptName: p.deptName || "",
                        gradeLevel: p.gradeLevel ? String(p.gradeLevel) : "",
                        studentNo: p.studentNo || "",
                        email: p.email || "",
                        phone: p.phone || "",
                    }));
                }
            })
            .catch(err => console.error("Failed to load profile", err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await applyMentoring({
                recruitmentId: recruitment.recruitmentId,
                role: "MENTEE",
                // If the backend expects these profile fields in the application request, include them. 
                // But typically application just links to account. 
                // The prompt says "자기 정보가 자동으로 입력되있는 상태였으면 좋겠어". 
                // It implies these are for display or maybe contact info update?
                // Assuming currently backend only takes recruitmentId/role based on previous file view.
                // If backend needs reason, we send reason.
                reason: formData.reason
            });
            toast.success("신청되었습니다.");
            onSuccess();
        } catch (e: any) {
            console.error(e);
            toast.error("신청 실패: " + (e.message || "알 수 없는 오류"));
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
                        <input
                            className={styles.input}
                            name="name"
                            value={formData.name}
                            readOnly
                            placeholder="이름"
                        />
                    </div>
                    <div className={styles.col}>
                        <label>모집명</label>
                        <input className={styles.input} type="text" value={recruitment.title} readOnly />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>학과</label>
                <input
                    className={styles.input}
                    name="deptName"
                    value={formData.deptName}
                    readOnly
                    placeholder="학과"
                />
            </div>

            <div className={styles.formGroup}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>학년</label>
                        <input
                            className={styles.input}
                            name="gradeLevel"
                            value={formData.gradeLevel}
                            readOnly
                            placeholder="학년"
                        />
                    </div>
                    <div className={styles.col}>
                        <label>학번</label>
                        <input
                            className={styles.input}
                            name="studentNo"
                            value={formData.studentNo}
                            readOnly
                            placeholder="학번"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>이메일</label>
                        <input
                            className={styles.input}
                            name="email"
                            type="email"
                            value={formData.email}
                            readOnly
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className={styles.col}>
                        <label>연락처</label>
                        <input
                            className={styles.input}
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            readOnly
                            placeholder="010-0000-0000"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>멘토링 신청 사유</label>
                <textarea
                    className={styles.textarea}
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="신청 사유를 입력하세요"
                />
            </div>
        </Modal>
    );
}
