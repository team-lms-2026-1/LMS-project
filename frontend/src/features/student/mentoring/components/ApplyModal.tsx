"use client";

import { useEffect, useState } from "react";
import styles from "../styles/studentMentoring.module.css";
import { MentoringRecruitment } from "@/features/admin/mentoring/api/types";
import { applyMentoring } from "@/features/admin/mentoring/api/mentoringApi";
import { getJson } from "@/lib/http";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

interface Props {
    recruitment: MentoringRecruitment;
    onClose: () => void;
    onSuccess: () => void;
}

export function ApplyModal({ recruitment, onClose, onSuccess }: Props) {
    const tApply = useI18n("mentoring.studentApply");

    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        deptName: "",
        gradeLevel: "",
        studentNo: "",
        email: "",
        phone: "",
        reason: ""
    });

    useEffect(() => {
        getJson<any>("/api/accounts/me")
            .then((res) => {
                if (res.data) {
                    const p = res.data;
                    setFormData((prev) => ({
                        ...prev,
                        name: p.name || "",
                        deptName: p.deptName || "",
                        gradeLevel: p.gradeLevel ? String(p.gradeLevel) : "",
                        studentNo: p.studentNo || "",
                        email: p.email || "",
                        phone: p.phone || ""
                    }));
                }
            })
            .catch((e: unknown) => {
                console.error(e);
                toast.error(tApply("messages.profileLoadFailed"));
            });
    }, [tApply]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await applyMentoring("student", {
                recruitmentId: recruitment.recruitmentId,
                role: "MENTEE",
                reason: formData.reason
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
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>{tApply("modal.fields.name")}</label>
                        <input
                            className={styles.input}
                            name="name"
                            value={formData.name}
                            readOnly
                            placeholder={tApply("modal.placeholders.name")}
                        />
                    </div>
                    <div className={styles.col}>
                        <label>{tApply("modal.fields.recruitmentTitle")}</label>
                        <input className={styles.input} type="text" value={recruitment.title} readOnly />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>{tApply("modal.fields.deptName")}</label>
                <input
                    className={styles.input}
                    name="deptName"
                    value={formData.deptName}
                    readOnly
                    placeholder={tApply("modal.placeholders.deptName")}
                />
            </div>

            <div className={styles.formGroup}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>{tApply("modal.fields.gradeLevel")}</label>
                        <input
                            className={styles.input}
                            name="gradeLevel"
                            value={formData.gradeLevel}
                            readOnly
                            placeholder={tApply("modal.placeholders.gradeLevel")}
                        />
                    </div>
                    <div className={styles.col}>
                        <label>{tApply("modal.fields.studentNo")}</label>
                        <input
                            className={styles.input}
                            name="studentNo"
                            value={formData.studentNo}
                            readOnly
                            placeholder={tApply("modal.placeholders.studentNo")}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label>{tApply("modal.fields.email")}</label>
                        <input
                            className={styles.input}
                            name="email"
                            type="email"
                            value={formData.email}
                            readOnly
                            placeholder={tApply("modal.placeholders.email")}
                        />
                    </div>
                    <div className={styles.col}>
                        <label>{tApply("modal.fields.phone")}</label>
                        <input
                            className={styles.input}
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            readOnly
                            placeholder={tApply("modal.placeholders.phone")}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>{tApply("modal.fields.reason")}</label>
                <textarea
                    className={styles.textarea}
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder={tApply("modal.placeholders.reason")}
                />
            </div>
        </Modal>
    );
}
